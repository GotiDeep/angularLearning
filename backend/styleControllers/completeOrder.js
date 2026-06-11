const db = require('../config/stylesConnection');

exports.completeOrder = async (req, res) => {
    const { orderIds } = req.body;

    if (!orderIds || orderIds.length === 0) {
        return res.status(400).json({ message: "No styles selected for order" });
    }

    const lastOrderQuery = "SELECT order_id, order_number FROM trn_order ORDER BY order_id DESC LIMIT 1";

    db.query(lastOrderQuery, async (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Internal Server Error" });
        }

        let newOrderId = 1;
        let orderNumber = 'ORD00001';

        if (result && result.length > 0) {
            newOrderId = result[0].order_id + 1;
            const lastOrderNumber = result[0].order_number;
            const numberPart = lastOrderNumber.replace('ORD', '');
            const nextNumber = parseInt(numberPart) + 1;
            const paddedNumber = nextNumber.toString().padStart(5, '0');
            orderNumber = `ORD${paddedNumber}`;
        }

        const orderedPcs = orderIds.length;
        const orderGrandTotal = orderIds.reduce((sum, style) => sum + parseFloat(style.grand_total_amount), 0);

        try {
            const insertQuery = "CALL trn_order(?,?,?,?,?)";

            await new Promise((resolve, reject) => {
                db.query(insertQuery, ['INSERT', newOrderId, orderNumber, orderedPcs, orderGrandTotal], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            res.status(200).json({
                success: true,
                message: `Ordered Created For Order Number ${orderNumber}`
            });

            for (const style of orderIds) {

                const checkOrderDetailsId = 'SELECT order_details_id FROM trn_order_details ORDER BY order_details_id DESC LIMIT 1';
                let order_details_id;

                await new Promise((resolve, reject) => {
                    db.query(checkOrderDetailsId, (err, result) => {
                        if (err) return reject(err);
                        
                        if (result && result.length > 0) {
                            order_details_id = result[0].order_details_id + 1;
                        } else {
                            order_details_id = 1;
                        }
                        resolve();
                    });
                });

                const trn_order_details = "CALL trn_order_details( ?, ?, ?, ?, ?)";

                await new Promise((resolve, reject) => {
                    db.query(trn_order_details, ["INSERT", order_details_id, newOrderId, style.id, style.grand_total_amount], (err, result) => {
                        if (err) {
                            console.log("Error in trn_order_details: ", err);
                            return reject(err);
                        }
                        resolve(result);
                    });
                });

                const get_material_details = "SELECT * FROM style_details WHERE style_number = ?";

                const material_details = await new Promise((resolve, reject) => {
                    db.query(get_material_details, [style.id], (err, result) => {
                        if (err) return reject(err);
                        resolve(result);
                    });
                });

                for (const material of material_details) {
                    const trn_order_material = "CALL trn_order_material(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                    
                    await new Promise((resolve, reject) => {
                        db.query(trn_order_material, [
                            'INSERT',
                            order_details_id,
                            material.style_number,
                            material.material_type,
                            material.metal_type,
                            material.metal_kt,
                            material.metal_weight,
                            material.metal_amount,
                            material.diamond_type,
                            material.diamond_shape,
                            material.diamond_color,
                            material.diamond_clarity,
                            material.diamond_size,
                            material.diamond_pcs,
                            material.diamond_caret,
                            material.diamond_amount
                        ], (err, result) => {
                            if (err) {
                                console.log("Error in trn_order_material: ", err);
                                return reject(err);
                            }
                            resolve(result);
                        });
                    });
                }
            }
        } catch (err) {
            console.log("Error in trn_order: ", err);
            if (!res.headersSent) {
                return res.status(500).json({ message: "Error saving order items to database" });
            }
        }
    });
};
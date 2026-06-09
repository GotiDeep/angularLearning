const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use("/uploads",express.static(path.join(__dirname,"uploads")))

app.use(cors());
app.use(express.json());

const authroutes = require("./routes/authroutes");
const customerRoutes = require("./routes/customerRoutes");
const styleRoutes = require("./routes/styleRoutes");
const permissionRoutes = require("./routes/permissionRoutes"); // ← Naya

app.use("/api",authroutes);
app.use("/api",customerRoutes);
app.use("/api",styleRoutes);
app.use("/api",permissionRoutes); // ← Naya



app.listen(3000, () => {
    console.log("Server Running On Port Number 3000");
});

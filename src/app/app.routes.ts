import { Routes } from '@angular/router';
import { Login }           from './Pages/login/login';
import { Signup }          from './Pages/signup/signup';
import { ShowData }        from './Pages/show-data/show-data';
import { AddEmployee }     from './Pages/addemployee/addemployee';
import { authGuard }       from './guards/auth-guard';
import { permGuard }       from './guards/perm-guard';
import { Customers }       from './Pages/customers/customers';
import { Import }          from './Pages/import/import';
import { AddCustomers }    from './Pages/add-customers/add-customers';
import { ImportCustomers } from './Pages/import-customers/import-customers';
import { StyleMaster }     from './Styles/style-master/style-master';
import { StyleListing }    from './Styles/style-listing/style-listing';
import { StyleDetails }    from './Styles/style-details/style-details';
import { Importstyles }    from './Styles/importstyles/importstyles';
import { Permissions }     from './Pages/permissions/permissions';
import { Unauthorized }    from './Pages/unauthorized/unauthorized';
import { ForgetPassword } from './Pages/forget-password/forget-password';
import { ResetPassword } from './Pages/reset-password/reset-password';

export const routes: Routes = [
    { path: '',           redirectTo: 'login', pathMatch: 'full' },
    { path: 'login',      component: Login },
    { path: 'signup',     component: Signup },
    { path: 'unauthorized', component: Unauthorized },

    // ─── EMPLOYEES ───
    {
        path: 'showdata',
        component: ShowData,
        canActivate: [authGuard, permGuard],
        data: { module: 'Employees' }
    },
    {
        path: 'addemployee',
        component: AddEmployee,
        canActivate: [authGuard, permGuard],
        data: { module: 'Employees' }
    },
    {
        path: 'editemployee/:id',
        component: AddEmployee,
        canActivate: [authGuard, permGuard],
        data: { module: 'Employees' }
    },
    {
        path: 'import',
        component: Import,
        canActivate: [authGuard, permGuard],
        data: { module: 'Employees' }
    },

    // ─── CUSTOMERS ───
    {
        path: 'customers',
        component: Customers,
        canActivate: [authGuard, permGuard],
        data: { module: 'Customers' }
    },
    {
        path: 'addcustomers',
        component: AddCustomers,
        canActivate: [authGuard, permGuard],
        data: { module: 'Customers' }
    },
    {
        path: 'editCustomer/:customerId',
        component: AddCustomers,
        canActivate: [authGuard, permGuard],
        data: { module: 'Customers' }
    },
    {
        path: 'customerDetails/:customerId',
        component: AddCustomers,
        canActivate: [authGuard],
        data: { module: 'Customers' }
    },
    {
        path: 'importCustomers',
        component: ImportCustomers,
        canActivate: [authGuard, permGuard],
        data: { module: 'Customers' }
    },

    // ─── STYLES ───
    {
        path: 'styleListing',
        component: StyleListing,
        canActivate: [authGuard, permGuard],
        data: { module: 'Styles' }
    },
    {
        path: 'styleMaster',
        component: StyleMaster,
        canActivate: [authGuard, permGuard],
        data: { module: 'Styles' }
    },
    {
        path: 'styleMaster/:id',
        component: StyleMaster,
        canActivate: [authGuard, permGuard],
        data: { module: 'Styles' }
    },
    {
        path: 'styleDetails/:id',
        component: StyleDetails,
        canActivate: [authGuard, permGuard],
        data: { module: 'Styles' }
    },
    {
        path: 'importStyles',
        component: Importstyles,
        canActivate: [authGuard, permGuard],
        data: { module: 'Styles' }
    },

    // ─── PERMISSIONS (Admin only) ───
    {
        path: 'permissions',
        component: Permissions,
        canActivate: [authGuard]
        // No permGuard — Admin always has access
    },

    {
        path: 'forget-password',
        component: ForgetPassword
    },
    {
        path: 'reset-password',
        component: ResetPassword
    }
];

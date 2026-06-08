import { Routes } from '@angular/router';
import { Login } from './Pages/login/login';
import { Signup } from './Pages/signup/signup';
import { ShowData } from './Pages/show-data/show-data';
import { AddEmployee } from './Pages/addemployee/addemployee';
import { authGuard } from './guards/auth-guard';
import { Customers } from './Pages/customers/customers';
import { Import } from './Pages/import/import';
import { AddCustomers } from './Pages/add-customers/add-customers';
import { ImportCustomers } from './Pages/import-customers/import-customers';
import { StyleMaster } from './Styles/style-master/style-master';
import { StyleListing } from './Styles/style-listing/style-listing';
import { StyleDetails } from './Styles/style-details/style-details';
import { Importstyles } from './Styles/importstyles/importstyles';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'signup',
        component: Signup
    },
    {
        path: 'showdata',
        component: ShowData,
        canActivate: [authGuard]
    },
    {
        path: 'addemployee',
        component: AddEmployee,
        canActivate: [authGuard]
    },
    {
        path: 'editemployee/:id',
        component: AddEmployee,
        canActivate: [authGuard]
    },
    {
        path: 'employeeDetails/:employeeId',
        component: ShowData,
        canActivate: [authGuard]
    },
    {
        path: 'printEmployees',
        component: ShowData,
        canActivate: [authGuard]
    },
    {
        path: 'import',
        component: Import,
        canActivate: [authGuard]
    },
    {
        path: 'customers',
        component: Customers,
        canActivate: [authGuard]
    },
    {
        path: 'addcustomers',
        component: AddCustomers,
        canActivate: [authGuard]
    },
    {
        path: 'editCustomer/:customerId',
        component: AddCustomers,
        canActivate: [authGuard]
    },
    {
        path: 'customerDetails/:customerId',
        component: AddCustomers,
        canActivate: [authGuard]
    },
    {
        path: 'printCustomersDetails',
        component: Customers,
        canActivate: [authGuard]
    },
    {
        path: 'importCustomers',
        component: ImportCustomers,
        canActivate: [authGuard]
    },
    {
        path: 'styleMaster',
        component: StyleMaster,
        canActivate: [authGuard]
    },
    {
        path: 'styleListing',
        component: StyleListing,
        canActivate: [authGuard]
    },
    {
        path: 'styleMaster/:id',
        component: StyleMaster,
        canActivate: [authGuard]
    },
    {
        path:'getStyle/:id',
        component:StyleListing,
        canActivate:[authGuard]
    },
    {
        path:'styleDetails/:id',
        component:StyleDetails,
        canActivate:[authGuard]
    },
    {
        path:'importStyles',
        component:Importstyles,
        canActivate:[authGuard]
    },
];

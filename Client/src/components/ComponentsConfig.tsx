// routesConfig.js
import DashBoardComponent from '../components/DashBoard/DashBoardComponent';
import PublishedListComponent from './PublishList/PublishListCompoent';
import PrivateRoute from '../AdminRoleAuthentication/PrivateRoute';
import UnauthorizedComponent from '../AdminRoleAuthentication/UnAutherized';
import MyOrder from '../components/MyOrders/MyOrders';
import CustomerCare from './CustomerCare/CustomerCare';
import ETender from "../components/ETender/ETender";
import MyReports from './MyReports/MyReports';
import EBuySettingsPage from './EBuySettings/EBuySettings';
import OrderTracking from "../components/OrderTracking/OrderTracking"
import ETenderProcess from './ETender/PublishETenderProcess/ETenderProcess';
import ETenderProcessPending from './ETender/PublishETenderProcess/ETenderProcessPending';
import ETenderUtility from "./ETender/ETenderUtility"
import OpenTenderProcess from "./ETender/OpenTenderProcess/OpenETenderProcess"
import OpenETenderProcessPending from "./ETender/OpenTenderProcess/OpenETenderProcessPending"

const routes = [
  {
    path: '/dashboard',
    element: () => <PrivateRoute element={DashBoardComponent} />
  },
  {
    path: '/publishedlist',
    element: PublishedListComponent
  },
  {
    path: '/unauthorized',
    element: UnauthorizedComponent
  },
  {
    path: '/myorders',
    element: MyOrder
  },
  {
    path: '/CustomerCare',
    element: CustomerCare
  },
  {
    path: '/eTender',
    element: () => <PrivateRoute element={ETender} restrictToUserType2={true} />
  },
  {
    path: '/myreports',
    element: MyReports
  },
  {
    path: '/settings',
    element: EBuySettingsPage
  },
  {
    path: '/ordertracking',
    element: OrderTracking
  },
  {
    path: '/tender-process',
    element: () => <PrivateRoute element={ETenderProcess} restrictToUserType2={true} />

  },
  {
    path: '/open-tender-process',
    element: () => <PrivateRoute element={OpenTenderProcess} restrictToUserType2={true} />
  },
  {
    path: '/tender-details',
    element: ETenderProcessPending
  },
  {
    path: '/open-tender-details',
    element: OpenETenderProcessPending
  },
  {
    path: '/etenderutility',
    element: () => <PrivateRoute element={ETenderUtility} restrictToUserType2={true} />
  }
];

export default routes;
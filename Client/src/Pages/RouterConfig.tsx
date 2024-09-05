// routesConfig.js
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import PinInputComponent from './PinInputComponent';
import PageNotFound from './PageNotFound';
import UserProfile from './UserProfile/UserProfile';

const routes = [
  {
    path: '/',
    element: LoginForm,
    exact: true
  },
  {
    path: '/register',
    element: RegisterForm
  },
  {
    path: '/enter-otp',
    element: PinInputComponent
  },
  {
    path: '/PageNotFound',
    element: PageNotFound
  },
  {
    path: '/userprofile',
    element: UserProfile
  }


];

export default routes;

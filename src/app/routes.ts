import { createBrowserRouter } from 'react-router';
import { RootLayout } from '@/app/components/RootLayout';
import Login from '@/app/pages/auth/Login';
import Signup from '@/app/pages/auth/Signup';
import UserHome from '@/app/pages/user/UserHome';
import SelectMovie from '@/app/pages/user/SelectMovie';
import SelectHall from '@/app/pages/user/SelectHall';
import MovieDetails from '@/app/pages/user/MovieDetails';
import HallDetails from '@/app/pages/user/HallDetails';
import MovieFirstFlow from '@/app/pages/user/MovieFirstFlow';
import HallFirstFlow from '@/app/pages/user/HallFirstFlow';
import MovieBooking from '@/app/pages/user/MovieBooking';
import SnackSelection from '@/app/pages/user/SnackSelection';
import Payment from '@/app/pages/user/Payment';
import Confirmation from '@/app/pages/user/Confirmation';
import Profile from '@/app/pages/user/Profile';
import AdminDashboard from '@/app/pages/admin/AdminDashboard';
import ManageMovies from '@/app/pages/admin/ManageMovies';
import ManageHalls from '@/app/pages/admin/ManageHalls';
import ManageSnacks from '@/app/pages/admin/ManageSnacks';
import ViewBookings from '@/app/pages/admin/ViewBookings';
import AdminMovieDetails from '@/app/pages/admin/AdminMovieDetails';
import AdminHallDetails from '@/app/pages/admin/AdminHallDetails';
import CreateEditMovie from '@/app/pages/admin/CreateEditMovie';
import CreateEditHall from '@/app/pages/admin/CreateEditHall';
import ManageTimeSlots from '@/app/pages/admin/ManageTimeSlots';
import Recommendations from '@/app/pages/user/Recommendations';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: '/',
        Component: Login,
      },
      {
        path: '/signup',
        Component: Signup,
      },
      {
        path: '/user/home',
        Component: UserHome,
      },
      {
        path: '/user/select-movie',
        Component: SelectMovie,
      },
      {
        path: '/user/select-hall',
        Component: SelectHall,
      },
      {
        path: '/user/movie/:movieId',
        Component: MovieDetails,
      },
      {
        path: '/user/hall/:hallId',
        Component: HallDetails,
      },
      {
        path: '/user/movie-flow/:movieId',
        Component: MovieFirstFlow,
      },
      {
        path: '/user/hall-flow/:hallId',
        Component: HallFirstFlow,
      },
      {
        path: '/user/booking/:movieId',
        Component: MovieBooking,
      },
      {
        path: '/user/snacks',
        Component: SnackSelection,
      },
      {
        path: '/user/payment',
        Component: Payment,
      },
      {
        path: '/user/confirmation/:bookingId',
        Component: Confirmation,
      },
      {
        path: '/user/profile',
        Component: Profile,
      },
      {
        path: '/user/recommendations',
        Component: Recommendations,
      },
      {
        path: '/admin/dashboard',
        Component: AdminDashboard,
      },
      {
        path: '/admin/movies',
        Component: ManageMovies,
      },
      {
        path: '/admin/movie/new',
        Component: CreateEditMovie,
      },
      {
        path: '/admin/movie/:movieId',
        Component: AdminMovieDetails,
      },
      {
        path: '/admin/movie/:movieId/edit',
        Component: CreateEditMovie,
      },
      {
        path: '/admin/halls',
        Component: ManageHalls,
      },
      {
        path: '/admin/hall/new',
        Component: CreateEditHall,
      },
      {
        path: '/admin/hall/:hallId',
        Component: AdminHallDetails,
      },
      {
        path: '/admin/hall/:hallId/edit',
        Component: CreateEditHall,
      },
      {
        path: '/admin/snacks',
        Component: ManageSnacks,
      },
      {
        path: '/admin/bookings',
        Component: ViewBookings,
      },
      {
        path: '/admin/timeslots',
        Component: ManageTimeSlots,
      },
    ],
  },
]);
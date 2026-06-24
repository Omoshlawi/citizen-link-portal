import {
  AboutUsPage,
  ChangeEmailVerifyPage,
  ContactUsPage,
  ForgotPasswordPage,
  HowItWorksPage,
  LoginPage,
  RegisterPage,
  ResetPasswordPage,
  TwoFactorVerifyPage,
  VerifyEmailPage,
} from '@/features/landing/pages';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { AddressManagementPage } from './features/addresses/pages';
import { DocumentTypesPage, IAMPage, SystemSettingsPage, TransitionReasonsPage } from './features/admin/pages';
import { DocumentCaseDetail, DocumentCasesPage } from './features/cases/pages';
import { ClaimDetailPage, ClaimsPage } from './features/claims/pages';
import {
  CustodyDetailPage,
  CustodyListPage,
  DocumentOperationTypesPage,
  PickupStationsPage,
  StaffStationOperationsPage,
} from './features/custody/pages';
import { DashboardLayout } from './features/dashboard/components';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { AuthLayout, LoginRequired } from './features/landing/components';
import LandingLayout from './features/landing/pages/LandingLayout';
import { MatchDetailPage, MatchesPage } from './features/matches/pages';
import { SettingsPage } from './features/settings';
import {
  StationContextRequired,
  StationSelectionLayout,
} from './features/station-context/components';
import { StationSelectionPage } from './features/station-context/pages';
import { StatusTransitionsPage } from './features/status-transitions/pages';
import { TemplateDetailPage, TemplatesPage } from './features/templates/pages';
import UiComponents from './features/ui/UiComponents';
import { UserDetailPage } from './features/users/pages';

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        path: '/about',
        element: <AboutUsPage />,
      },
      {
        path: '/how-it-works',
        element: <HowItWorksPage />,
      },
      {
        path: '/contact',
        element: <ContactUsPage />,
      },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      {
        path: '/register',
        element: <RegisterPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        element: <ResetPasswordPage />,
      },
      {
        path: '/two-factor-verify',
        element: <TwoFactorVerifyPage />,
      },
      {
        path: '/verify-email',
        element: <VerifyEmailPage />,
      },
      {
        path: '/change-email-verify',
        element: <ChangeEmailVerifyPage />,
      },
    ],
  },
  {
    path: '/select-station',
    element: (
      <LoginRequired redirectTo="/login">
        <StationSelectionLayout />
      </LoginRequired>
    ),
    children: [{ index: true, element: <StationSelectionPage /> }],
  },
  {
    path: '/dashboard',
    element: (
      <LoginRequired>
        <StationContextRequired>
          <DashboardLayout />
        </StationContextRequired>
      </LoginRequired>
    ),
    children: [
      {
        path: '',
        element: <Outlet />,
        children: [
          { index: true, element: <DashboardPage /> },
          {
            path: 'cases',
            element: <Outlet />,
            children: [
              { index: true, element: <DocumentCasesPage /> },
              { path: ':reportId', element: <DocumentCaseDetail /> },
            ],
          },
          {
            path: 'settings',
            element: <SettingsPage />,
            children: [{ path: ':tab', element: <SettingsPage /> }],
          },
          {
            path: 'claims',
            element: <Outlet />,
            children: [
              { index: true, element: <ClaimsPage /> },
              { path: ':claimId', element: <ClaimDetailPage /> },
            ],
          },
          {
            path: 'matches',
            element: <Outlet />,
            children: [
              { index: true, element: <MatchesPage /> },
              { path: ':matchId', element: <MatchDetailPage /> },
            ],
          },
          {
            path: 'status-transitions',
            element: <StatusTransitionsPage />,
          },
          {
            path: 'custody',
            element: <Outlet />,
            children: [
              { index: true, element: <CustodyListPage /> },
              { path: ':foundCaseId', element: <CustodyDetailPage /> },
            ],
          },
          { path: 'document-operation-types', element: <DocumentOperationTypesPage /> },
          { path: 'stations', element: <PickupStationsPage /> },
          { path: 'operation-scope', element: <StaffStationOperationsPage /> },
          { path: 'components', element: <UiComponents /> },
          {
            path: 'document-types',
            element: <DocumentTypesPage />,
          },
          {
            path: 'system-settings',
            element: <SystemSettingsPage />,
          },
          {
            path: 'status-transition-reasons',
            element: <TransitionReasonsPage />,
          },
          {
            path: 'iam',
            element: <IAMPage />,
          },
          {
            path: 'address-management',
            element: <AddressManagementPage />,
          },
          {
            path: 'users',
            element: <Outlet />,
            children: [{ path: ':id', element: <UserDetailPage /> }],
          },
          {
            path: 'templates',
            element: <Outlet />,
            children: [
              { index: true, element: <TemplatesPage /> },
              { path: ':id', element: <TemplateDetailPage /> },
            ],
          },
        ],
      },
    ],
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}

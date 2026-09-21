import { useDeliveryConfirmLink } from '../hooks';
import OpenInAppPage from './OpenInAppPage';

/**
 * Route element for /delivery/confirm?code=…
 * The URL printed on every courier delivery label.
 */
const ConfirmDeliveryPage = () => <OpenInAppPage target={useDeliveryConfirmLink()} />;

export default ConfirmDeliveryPage;

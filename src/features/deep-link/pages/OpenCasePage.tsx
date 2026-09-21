import { useDeepLink } from '../hooks';
import OpenInAppPage from './OpenInAppPage';

/** Route element for /open/:resource/:id? */
const OpenCasePage = () => <OpenInAppPage target={useDeepLink()} />;

export default OpenCasePage;

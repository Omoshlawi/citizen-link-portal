import { MatchAnalysisTab, MatchComparisonTab, MatchImagesTab } from '../components';
import { useMatchDetail } from './MatchDetailPage';

export const MatchComparisonRoute = () => <MatchComparisonTab match={useMatchDetail().match} />;

export const MatchAnalysisRoute = () => <MatchAnalysisTab match={useMatchDetail().match} />;

export const MatchImagesRoute = () => <MatchImagesTab match={useMatchDetail().match} />;

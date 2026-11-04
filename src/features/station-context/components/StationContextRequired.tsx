import { FC, PropsWithChildren, useEffect, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useMyPermissions } from '@/features/admin/hooks/useRoleRecords';
import { hasAnyPermission, STATION_WORK } from '@/features/dashboard/navigation/permissions';
import { useActiveStation } from '@/hooks/useActiveStation';
import { useMyStations } from '@/hooks/useMyStations';
import { usePreferredStationSetting } from '@/hooks/usePreferredStation';
import { useUserHasSystemAccess } from '@/hooks/useSystemAccess';
import { authClient } from '@/lib/api';

/**
 * Ensures staff who work at a station have a session station they may operate from. Staff who
 * do no station work pass straight through.
 * Staff with grants: station must appear in `/operation-scope/mine`.
 * Users with `documentOperationType: manage` may check in to any station (same rule as
 * {@link StationSelectionPage}); session `stationId` is validated via `/stations/:id`.
 *
 * Saved preference (`preferred.station.id`) is applied into the session on load: staff via
 * the mine list branch; manage users who picked a station outside their grants via PATCH here.
 */

const StationContextRequired: FC<PropsWithChildren> = ({ children }) => {
  const { data: sessionData, isPending: sessionPending } = authClient.useSession();
  const { permissions, isLoading: permissionsLoading } = useMyPermissions();
  const { stations, isLoading: stationsLoading } = useMyStations();
  const { preferredStationId, isLoading: prefLoading } = usePreferredStationSetting();
  const { setStation, activeStation, isLoading: activeStationLoading } = useActiveStation();
  const { pathname } = useLocation();

  const { hasAccess: canManageAnyStation, isLoading: managePermLoading } = useUserHasSystemAccess({
    documentOperationType: ['manage'],
  });

  const sessionStationId: string | null = (sessionData?.session as any)?.stationId ?? null;
  const effectivestationId = sessionStationId ?? preferredStationId ?? null;

  const stationInMine = useMemo(() => {
    if (!effectivestationId) {
      return false;
    }
    return stations.some((stat) => stat.id === effectivestationId);
  }, [stations, effectivestationId]);

  const preferredNotInMine =
    Boolean(preferredStationId) &&
    !stationsLoading &&
    !stations.some((s) => s.id === preferredStationId);

  /** Manage users: new session has no stationId yet but settings store a preferred station not in mine. */
  const awaitingPreferredSessionApply =
    Boolean(preferredStationId) &&
    !sessionStationId &&
    !prefLoading &&
    !stationsLoading &&
    !sessionPending &&
    !managePermLoading &&
    canManageAnyStation &&
    preferredNotInMine;

  useEffect(() => {
    if (!awaitingPreferredSessionApply || !preferredStationId) {
      return;
    }
    void setStation(preferredStationId);
  }, [awaitingPreferredSessionApply, preferredStationId, setStation]);

  const validStation = useMemo(() => {
    if (!effectivestationId) {
      return null;
    }

    if (stationInMine) {
      const found = stations.find((stat) => stat.id === effectivestationId)!;
      if (!sessionStationId) {
        setStation(effectivestationId);
      }
      return found;
    }

    if (
      canManageAnyStation &&
      sessionStationId &&
      sessionStationId === effectivestationId &&
      activeStation?.id === sessionStationId
    ) {
      return activeStation;
    }

    return null;
  }, [
    stations,
    sessionStationId,
    preferredStationId,
    stationInMine,
    effectivestationId,
    canManageAnyStation,
    activeStation,
    setStation,
  ]);

  const sessionStationNotInMine =
    Boolean(sessionStationId) &&
    !stations.some((s) => s.id === sessionStationId) &&
    !stationsLoading;

  const awaitingManageBypass =
    sessionStationNotInMine && (managePermLoading || (canManageAnyStation && activeStationLoading));

  if (!permissionsLoading && !hasAnyPermission(permissions, STATION_WORK)) {
    return <>{children}</>;
  }

  if (
    permissionsLoading ||
    sessionPending ||
    stationsLoading ||
    prefLoading ||
    awaitingManageBypass ||
    awaitingPreferredSessionApply
  ) {
    return (
      <Center h="100vh">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!validStation) {
    return <Navigate replace to={`/select-station?callBackUrl=${encodeURIComponent(pathname)}`} />;
  }

  return <>{children}</>;
};

export default StationContextRequired;

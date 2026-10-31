import { useLocation, useNavigate } from 'react-router-dom';
import { Tabs, TabsProps } from '@mantine/core';
import { TablerIcon, TablerIconName } from '../TablerIcon';

export type RouteTab = {
  /** Path segment under `basePath`; `''` is the index route. */
  value: string;
  label: string;
  icon: TablerIconName;
};

const INDEX_KEY = '__index__';

type RouteTabsProps = {
  basePath: string;
  tabs: RouteTab[];
  iconSize?: number;
  variant?: TabsProps['variant'];
};

/**
 * Tab strip driven by the URL path. Each tab is a child route of `basePath`,
 * so the active tab survives reloads, can be linked to, and works with Back.
 * Renders the list only — the parent layout renders the tab body via `<Outlet />`.
 */
const RouteTabs = ({ basePath, tabs, iconSize = 14, variant }: RouteTabsProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const resolve = (value: string) => (value ? `${basePath}/${value}` : basePath);
  // Mantine treats tab values as non-empty keys, so the index route gets a sentinel.
  const toKey = (value: string) => value || INDEX_KEY;
  const fromKey = (key: string) => (key === INDEX_KEY ? '' : key);

  const active = tabs.find(({ value }) => {
    const path = resolve(value);
    return value === ''
      ? location.pathname === path
      : location.pathname === path || location.pathname.startsWith(`${path}/`);
  });

  return (
    <Tabs
      value={active ? toKey(active.value) : null}
      onChange={(key) => key !== null && navigate(resolve(fromKey(key)))}
      variant={variant}
    >
      <Tabs.List>
        {tabs.map(({ value, label, icon }) => (
          <Tabs.Tab
            key={value}
            value={toKey(value)}
            leftSection={<TablerIcon name={icon} size={iconSize} />}
          >
            {label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs>
  );
};

export default RouteTabs;

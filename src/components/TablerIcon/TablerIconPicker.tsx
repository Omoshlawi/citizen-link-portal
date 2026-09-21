import React, { useMemo, useState } from 'react';
import { Pagination } from '@mantine/core';
import { spotlight, Spotlight } from '@mantine/spotlight';
import { getAllTablerIconNames } from './helpers';
import TablerIcon from './TablerIcon';
import { TablerIconName } from './types';

type TriggerComponentProps = {
  onTrigger: () => void;
};

type TablerIconPickerProps = {
  renderTriggerComponent?: (props: TriggerComponentProps) => React.ReactNode;
  initialIcon?: TablerIconName;
  onIconSelect?: (icon: TablerIconName) => void;
};

const ITEMS_PER_PAGE = 20; // Define the number of cases per page

const TablerIconPicker: React.FC<TablerIconPickerProps> = ({
  renderTriggerComponent,
  initialIcon,
  onIconSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialIcon ?? '');
  const allIconNames = useMemo(() => {
    if (typeof renderTriggerComponent !== 'function') {
      return [];
    }
    return getAllTablerIconNames();
  }, [renderTriggerComponent]);

  const [activePage, setActivePage] = useState(1);

  const filteredIconNames = useMemo(() => {
    return allIconNames.filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [allIconNames, searchQuery]);

  const paginatedItems = useMemo(() => {
    const start = (activePage - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredIconNames.slice(start, end);
  }, [activePage, filteredIconNames]);

  const totalPages = Math.ceil(filteredIconNames.length / ITEMS_PER_PAGE);

  const actions = useMemo(() => {
    if (!paginatedItems.length) {
      return <Spotlight.Empty>Nothing found...</Spotlight.Empty>;
    }
    return paginatedItems.map((name) => (
      <Spotlight.Action
        key={name}
        highlightQuery
        label={name}
        leftSection={<TablerIcon name={name} />}
        description={`Icon${name.charAt(0).toUpperCase() + name.slice(1)}`}
        onClick={() => {
          if (onIconSelect) {
            onIconSelect(name);
          }
          spotlight.close();
        }}
      />
    ));
  }, [paginatedItems, onIconSelect]);

  if (typeof renderTriggerComponent !== 'function') {
    return null;
  }

  return (
    <>
      {renderTriggerComponent({ onTrigger: spotlight.open })}
      <Spotlight.Root
        scrollable
        maxHeight="80vh"
        query={searchQuery}
        onQueryChange={setSearchQuery}
        onSpotlightClose={() => setActivePage(1)} // Reset page on close for better UX
      >
        <Spotlight.Search
          placeholder="Search..."
          leftSection={<TablerIcon name="search" size={20} stroke={1.5} />}
        />
        <Spotlight.ActionsList>{actions}</Spotlight.ActionsList>
        {totalPages > 1 && (
          <Spotlight.Footer>
            <Pagination
              total={totalPages}
              siblings={1}
              value={activePage}
              onChange={setActivePage}
            />
          </Spotlight.Footer>
        )}
      </Spotlight.Root>
    </>
  );
};

export default TablerIconPicker;

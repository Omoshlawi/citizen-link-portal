import React, { PropsWithChildren } from 'react';
import { Button, Flex, Group, Paper, Text } from '@mantine/core';

type CardHeaderProps = PropsWithChildren<{
  title: string;
}>;

const CardHeader: React.FC<CardHeaderProps> = ({ title, children }) => {
  return (
    <Paper px="xs">
      <Flex align="center">
        <Text>{title}</Text>
        <Flex flex={1} bg="red" />
        <Group>{children}</Group>
      </Flex>
    </Paper>
  );
};

export default CardHeader;

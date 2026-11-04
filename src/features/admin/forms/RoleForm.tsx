import React, { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { handleApiErrors } from '@/lib/api';
import { useResources, useRoleRecordsApi } from '../hooks/useRoleRecords';
import { PermissionGrant, RoleFormData, RoleRecord } from '../types';
import { RoleSchema } from '../utils';

interface RoleFormProps {
  role?: RoleRecord;
  closeWorkspace: () => void;
}

function grantKey({ resource, action }: PermissionGrant): string {
  return `${resource}:${action}`;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const RoleForm: React.FC<RoleFormProps> = ({ role, closeWorkspace }) => {
  const { createRole, updateRole, setRolePermissions, mutateRoles } = useRoleRecordsApi();
  const { resources } = useResources();

  // Selected privileges, as grantKey strings
  const initialSelected = useMemo(() => new Set(role?.permissions.map(grantKey) ?? []), [role]);
  const [selected, setSelected] = useState<Set<string>>(initialSelected);

  const form = useForm<RoleFormData>({
    defaultValues: {
      name: role?.name ?? '',
      slug: role?.slug ?? '',
      description: role?.description ?? '',
    },
    resolver: zodResolver(RoleSchema),
  });

  // Auto-generate slug from name for new roles
  const nameValue = form.watch('name');
  useEffect(() => {
    if (!role) {
      form.setValue('slug', slugify(nameValue));
    }
  }, [nameValue, role, form]);

  const toggleGrant = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleSubmit: SubmitHandler<RoleFormData> = async (data) => {
    try {
      const { slug: _slug, ...editable } = data;
      const saved = role ? await updateRole(role.id, editable) : await createRole(data);
      const permissions = resources.flatMap((resource) =>
        resource.actions
          .map((action) => ({ resource: resource.slug, action: action.slug }))
          .filter((grant) => selected.has(grantKey(grant)))
      );

      await setRolePermissions(saved!.id, permissions);

      showNotification({
        title: 'Success',
        message: role ? 'Role updated' : 'Role created',
        color: 'green',
      });
      mutateRoles();
      closeWorkspace();
    } catch (error) {
      const e = handleApiErrors<RoleFormData>(error);
      if (e.detail) {
        showNotification({ title: 'Error', message: e.detail, color: 'red' });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof RoleFormData, { message: val })
        );
      }
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      style={{ flex: 1, flexDirection: 'column', justifyContent: 'space-between' }}
    >
      <Stack p="md" h="100%" justify="space-between">
        <Stack gap="md">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Name"
                placeholder="e.g. Finance Officer"
                error={fieldState.error?.message}
                required
              />
            )}
          />
          <Controller
            control={form.control}
            name="slug"
            render={({ field, fieldState }) => (
              <TextInput
                {...field}
                label="Slug"
                placeholder="e.g. finance-officer"
                description="Used in user.role — must be kebab-case, and cannot change once created"
                error={fieldState.error?.message}
                readOnly={!!role}
                required
              />
            )}
          />
          <Controller
            control={form.control}
            name="description"
            render={({ field, fieldState }) => (
              <Textarea
                {...field}
                value={field.value ?? ''}
                label="Description"
                placeholder="What does this role do?"
                error={fieldState.error?.message}
              />
            )}
          />

          <Divider label="Permissions" labelPosition="left" />

          <ScrollArea h={360} offsetScrollbars>
            <Stack gap="sm">
              {resources.map((resource) => (
                <Box key={resource.slug}>
                  <Group gap="xs" mb={4}>
                    <Text size="sm" fw={600}>
                      {resource.name}
                    </Text>
                    <Text size="xs" ff="monospace" c="dimmed">
                      {resource.slug}
                    </Text>
                  </Group>
                  <Stack gap={2} pl="sm">
                    {resource.actions.map((action) => {
                      const key = grantKey({ resource: resource.slug, action: action.slug });
                      return (
                        <Group key={key} gap="xs">
                          <Checkbox
                            size="xs"
                            checked={selected.has(key)}
                            onChange={() => toggleGrant(key)}
                            label={
                              <Group gap={4}>
                                <Text size="xs">{action.name}</Text>
                                <Text size="xs" ff="monospace" c="dimmed">
                                  {action.slug}
                                </Text>
                              </Group>
                            }
                          />
                        </Group>
                      );
                    })}
                  </Stack>
                </Box>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
        <Group gap={1}>
          <Button flex={1} variant="default" radius={0} onClick={closeWorkspace}>
            Cancel
          </Button>
          <Button
            flex={1}
            radius={0}
            type="submit"
            variant="filled"
            loading={form.formState.isSubmitting}
            disabled={form.formState.isSubmitting}
          >
            {role ? 'Update' : 'Create'}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};

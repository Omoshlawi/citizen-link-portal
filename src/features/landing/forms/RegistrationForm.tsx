import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Flex,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { TablerIcon } from '@/components';
import { authClient, handleApiErrors } from '@/lib/api';
import { RegistrationFormData } from '../types';
import { RegistrationValidationSchema } from '../utils/validation';

const RegistrationForm = () => {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [emailSent, setEmailSent] = useState<string | null>(null);

  const form = useForm<RegistrationFormData>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
    },
    resolver: zodResolver(RegistrationValidationSchema),
  });

  const handleSubmit: SubmitHandler<RegistrationFormData> = async (values) => {
    try {
      const { error } = await authClient.signUp.email({
        ...values,
        name: `${values.firstName} ${values.lastName}`,
      });
      if (error) {
        throw error;
      }
      setEmailSent(values.email);
    } catch (error) {
      const e = handleApiErrors<RegistrationFormData>(error);
      if (e.detail) {
        showNotification({
          title: 'Registration Failed',
          message: e.detail,
          color: 'red',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof RegistrationFormData, { message: val })
        );
      }
    }
  };

  if (emailSent) {
    return (
      <Stack gap="xl" align="center" py="xl">
        <ThemeIcon size={64} variant="light" color="civicBlue">
          <TablerIcon name="mailCheck" size={32} stroke={1.5} />
        </ThemeIcon>
        <Stack gap="xs" align="center">
          <Title order={2} fw={700} ta="center">
            Check Your Email
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={320}>
            We&apos;ve sent a verification link to{' '}
            <Text component="span" fw={600} c="civicNavy.7" size="sm">
              {emailSent}
            </Text>
            . Please verify your email before signing in.
          </Text>
        </Stack>
        <Alert
          color="civicBlue"
          icon={<TablerIcon name="infoCircle" size={16} />}
          maw={360}
          w="100%"
        >
          Didn&apos;t receive the email? Check your spam folder or contact support.
        </Alert>
        <Text
          component={Link}
          to={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
          size="sm"
          c="civicBlue.6"
          style={{ textDecoration: 'none' }}
        >
          Back to Sign In
        </Text>
      </Stack>
    );
  }
  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <Box>
          <Text variant="gradient" size="xl" mb="md" style={{ textWrap: 'wrap' }} fw={700}>
            Sign Up
          </Text>
          <Text c="gray">Enter your information to create an account</Text>
        </Box>
        <Controller
          control={form.control}
          name="firstName"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="First name"
              error={fieldState.error?.message}
              placeholder="e.g joe"
            />
          )}
        />

        <Controller
          control={form.control}
          name="lastName"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Last name"
              error={fieldState.error?.message}
              placeholder="e.g doe"
            />
          )}
        />

        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Email address"
              type="email"
              error={fieldState.error?.message}
              placeholder="e.g joedoe@abc.com"
            />
          )}
        />

        <Controller
          control={form.control}
          name="confirmPassword"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Confirm Password"
              error={fieldState.error?.message}
              placeholder="*********"
            />
          )}
        />
        <Controller
          control={form.control}
          name="password"
          render={({ field, fieldState }) => (
            <PasswordInput
              {...field}
              label="Password"
              error={fieldState.error?.message}
              placeholder="*********"
            />
          )}
        />
        <Button type="submit" loading={form.formState.isSubmitting} variant="gradient">
          Register
        </Button>
        <Flex justify="flex-start" align="center">
          <Text>Already have an account?</Text>
          <Link
            to={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          >
            <Button variant="transparent" p="xs">
              Sign in
            </Button>
          </Link>
        </Flex>
      </Stack>
    </form>
  );
};

export default RegistrationForm;

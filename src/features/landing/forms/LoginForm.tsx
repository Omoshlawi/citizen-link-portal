import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Checkbox, Flex, PasswordInput, Stack, Text, TextInput } from '@mantine/core';
import { showNotification } from '@mantine/notifications';
import { authClient, handleApiErrors } from '@/lib/api';
import { LoginFormData } from '../types';
import { LoginValidationSchema } from '../utils/validation';

const LoginForm = () => {
  const [searchParams] = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const { data } = authClient.useSession();

  const navigate = useNavigate();
  const form = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
    resolver: zodResolver(LoginValidationSchema),
  });

  const handleSubmit: SubmitHandler<LoginFormData> = async (values) => {
    try {
      const { data: signInData, error } = await authClient.signIn.email({ ...values });
      if (error) {
        throw error;
      }
      if ((signInData as any)?.twoFactorRedirect) {
        const destination = callbackUrl
          ? `/two-factor-verify?callbackUrl=${encodeURIComponent(callbackUrl)}`
          : '/two-factor-verify';
        navigate(destination, { replace: true });
        return;
      }
      showNotification({
        title: 'Login successful',
        message: 'You have successfully logged in',
        color: 'green',
        position: 'top-right',
      });
      if (callbackUrl) {
        navigate(callbackUrl, { replace: true });
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      const e = handleApiErrors<LoginFormData>(error);
      if (e.detail) {
        showNotification({
          title: 'Login Failed',
          message: e.detail,
          color: 'red',
          position: 'top-right',
        });
      } else {
        Object.entries(e).forEach(([key, val]) =>
          form.setError(key as keyof LoginFormData, { message: val })
        );
      }
    }
  };

  useEffect(() => {
    if (data) {
      if (callbackUrl) {
        navigate(callbackUrl, { replace: true });
      } else {
        navigate('/dashboard');
      }
    }
  }, [data, navigate]);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Stack gap="md">
        <Box>
          <Text variant="gradient" size="xl" mb="md" style={{ textWrap: 'wrap' }} fw={700}>
            Sign In
          </Text>
          <Text c="gray">Enter your email below to login to your account</Text>
        </Box>
        <Controller
          control={form.control}
          name="email"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              label="Email"
              error={fieldState.error?.message}
              placeholder="e.g joedoe@abc.com"
              type="email"
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
        <Controller
          control={form.control}
          name="rememberMe"
          render={({ field, fieldState }) => (
            <Checkbox
              ref={field.ref}
              checked={field.value}
              onToggle={(e) => field.onChange(e.currentTarget.checked)}
              title="Remember Me"
              label="Remember Me"
              error={fieldState.error?.message}
              placeholder="*********"
            />
          )}
        />
        <Button type="submit" variant="gradient" loading={form.formState.isSubmitting}>
          Login
        </Button>
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: 'column', sm: 'row' }}
          gap="sm"
        >
          <Link to="/forgot-password">
            <Text size="sm" c="blue" style={{ cursor: 'pointer' }}>
              Forgot password?
            </Text>
          </Link>
          {/* Self-registration is disabled in the portal: citizens sign up in
              the mobile app, and staff accounts are created for them and the
              credentials issued. Kept rather than deleted so it can be
              switched back on.
          <Flex justify="flex-end" align="center">
            <Text size="sm">Don't have an account?</Text>
            <Link
              to={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
            >
              <Button variant="transparent" p="xs">
                Sign up
              </Button>
            </Link>
          </Flex>
          */}
        </Flex>
      </Stack>
    </form>
  );
};

export default LoginForm;

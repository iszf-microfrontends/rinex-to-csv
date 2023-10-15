import { notifications, type NotificationProps } from '@mantine/notifications';
import { attach, createEffect, createEvent, sample } from 'effector';

export interface NotifyOptions {
  title?: string;
  message: string;
}

const notifyFx = createEffect<NotificationProps, void>((props) => {
  notifications.show({ withBorder: true, ...props });
});

const notifyErrorFx = attach({
  effect: notifyFx,
  mapParams: (options: NotifyOptions): NotificationProps => ({
    ...options,
    color: 'red',
  }),
});

export const errorNotified = createEvent<NotifyOptions>();

sample({ clock: errorNotified, target: notifyErrorFx });

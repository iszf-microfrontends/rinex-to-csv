import { attach, createEffect, createEvent, sample } from 'effector';

import { NotificationProps, notifications } from '@mantine/notifications';

type ShowNotificationOptions = {
  title?: string;
  message: string;
};

export const showError = createEvent<ShowNotificationOptions>();

const showFx = createEffect<NotificationProps, void>((props) => {
  notifications.show({ withBorder: true, ...props });
});

const showErrorFx = attach({
  effect: showFx,
  mapParams: (options: ShowNotificationOptions): NotificationProps => ({
    ...options,
    color: 'red',
  }),
});

sample({ clock: showError, target: showErrorFx });

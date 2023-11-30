import useReactQueryScry from '@/logic/useReactQueryScry';
import useQueryClient, { useMutation } from '@tanstack/react-query';
import queryClient from '@/queryClient';
import { Flag } from '@/types/hark';
import { isDm } from '@/notifications/useNotifications';
import { whomIsDm, whomIsFlag, whomIsMultiDm, whomIsNest } from '@/logic/utils';
import { useMemo } from 'react';
import api from '@/api';
import _ from 'lodash';
import { Groups } from '@/types/groups';
import { Nest } from '@/types/channel';
import { useGroups } from './groups';

const pinsKey = () => ['pins'];

type Pin = string; // whom or nest or flag
type Pins = Pin[];

export function bootstrapPins(pins: Pins) {
  queryClient.setQueryData(pinsKey(), pins);
}

export function usePins(): Pins {
  const { data } = useReactQueryScry<{ pins: Pins }>({
    queryKey: pinsKey(),
    app: 'groups-ui',
    path: '/pins',
  });

  if (!data || !data.pins) {
    return queryClient.getQueryData(pinsKey()) || [];
  }

  return data.pins;
}

export function useTalkPins(): Pins {
  const allPins = usePins();
  return useMemo(
    () =>
      allPins.filter(
        (pin) => whomIsDm(pin) || whomIsMultiDm(pin) || whomIsNest(pin)
      ),
    [allPins]
  );
}

export function useClubPins(): Pins {
  const pins = useTalkPins();
  return useMemo(() => pins.filter(whomIsMultiDm), [pins]);
}

export function useGroupPins(): Pins {
  const allPins = usePins();
  return useMemo(() => allPins.filter((pin) => whomIsFlag(pin)), [allPins]);
}

export function usePinnedGroups(): Groups {
  const pins = useGroupPins();
  const groups = useGroups();

  return pins.reduce(
    (acc, pin) => ({ ...acc, [pin]: groups[pin] }),
    {} as Groups
  );
}

export function useAddPinMutation() {
  const pins = usePins();

  const mutationFn = async (variables: { pin: Pin }) => {
    await api.poke({
      app: 'groups-ui',
      mark: 'pin-add',
      json: variables.pin,
    });
  };

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries(pinsKey());
      const newPins = _.uniq([...pins, variables.pin]);
      queryClient.setQueryData(pinsKey(), newPins);
    },
    onSettled: () => {
      queryClient.invalidateQueries(pinsKey());
    },
  });
}

export function useDeletePinMutation() {
  const pins = usePins();

  const mutationFn = async (variables: { pin: Pin }) => {
    await api.poke({
      app: 'groups-ui',
      mark: 'pin-del',
      json: variables.pin,
    });
  };

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries(pinsKey());
      const newPins = pins.filter((pin) => pin !== variables.pin);
      queryClient.setQueryData(pinsKey(), newPins);
    },
    onSettled: () => {
      queryClient.invalidateQueries(pinsKey());
    },
  });
}

import cn from 'classnames';
import CaretLeft16Icon from '@/components/icons/CaretLeft16Icon';
import { useIsMobile } from '@/logic/useMedia';
import { getFlagParts, isTalk } from '@/logic/utils';
import { useChannel } from '@/state/groups';
import { Link } from 'react-router-dom';
import ShipConnection from '@/components/ShipConnection';
import { useConnectivityCheck } from '@/state/vitals';
import { get } from 'lodash';
import Bullet16Icon from '@/components/icons/Bullet16Icon';
import ChannelIcon from './ChannelIcon';

interface ChannelTitleButtonProps {
  flag: string;
  nest: string;
}

export default function ChannelTitleButton({
  flag,
  nest,
}: ChannelTitleButtonProps) {
  const isMobile = useIsMobile();
  const channel = useChannel(flag, nest);
  const { ship } = getFlagParts(flag);
  const BackButton = isMobile ? Link : 'div';
  const { data, showConnection } = useConnectivityCheck(ship || '');

  function backTo() {
    if (isMobile && isTalk) {
      return '/';
    }
    return `/groups/${flag}`;
  }

  return (
    <BackButton
      to={backTo()}
      className={cn(
        'default-focus ellipsis w-max-sm inline-flex h-10 appearance-none items-center justify-center space-x-2 rounded p-2'
      )}
      aria-label="Open Channels Menu"
    >
      {isMobile ? (
        <div className="flex h-6 w-6 items-center justify-center">
          <CaretLeft16Icon className="h-5 w-5 shrink-0 text-gray-600" />
        </div>
      ) : null}
      <ChannelIcon nest={nest} className="h-6 w-6 shrink-0 text-gray-600" />
      <div className="flex w-full flex-col justify-center">
        <div
          className={cn(
            'ellipsis flex flex-row items-center space-x-1 font-bold  sm:font-semibold',
            channel?.meta.description ? 'text-sm' : 'text-lg sm:text-sm'
          )}
        >
          <span className="line-clamp-1">{channel?.meta.title}</span>
          {ship !== window.our ? (
            <ShipConnection
              ship={ship}
              showBullet={true}
              showText={false}
              status={data?.status}
            />
          ) : (
            <span title="You host this channel">
              <Bullet16Icon className="h-4 w-4 text-green-300" />
            </span>
          )}
        </div>
        <span className="w-full break-all text-sm text-gray-400 line-clamp-1">
          {channel?.meta.description}
        </span>
      </div>
    </BackButton>
  );
}

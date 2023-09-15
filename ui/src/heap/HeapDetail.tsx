import bigInt from 'big-integer';
import cn from 'classnames';
import { Helmet } from 'react-helmet';
import { Link, useLocation } from 'react-router-dom';
import { useParams } from 'react-router';
import { BigIntOrderedMap } from '@urbit/api';
import {
  useJoinMutation,
  useNote,
  useOrderedNotes,
} from '@/state/channel/channel';
import Layout from '@/components/Layout/Layout';
import { useRouteGroup } from '@/state/groups';
import CaretRightIcon from '@/components/icons/CaretRightIcon';
import CaretLeftIcon from '@/components/icons/CaretLeftIcon';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { useFullChannel } from '@/logic/channel';
import { useGroupsAnalyticsEvent } from '@/logic/useAnalyticsEvent';
import { ViewProps } from '@/types/groups';
import { useIsMobile } from '@/logic/useMedia';
import getHanDataFromEssay from '@/logic/getHanData';
import { newQuipMap, Note, Quip } from '@/types/channel';
import HeapDetailSidebarInfo from './HeapDetail/HeapDetailSidebar/HeapDetailSidebarInfo';
import HeapDetailComments from './HeapDetail/HeapDetailSidebar/HeapDetailComments';
import HeapDetailHeader from './HeapDetail/HeapDetailHeader';
import HeapDetailBody from './HeapDetail/HeapDetailBody';

export default function HeapDetail({ title }: ViewProps) {
  const location = useLocation();
  const groupFlag = useRouteGroup();
  const { chShip, chName, idCurio } = useParams<{
    chShip: string;
    chName: string;
    idCurio: string;
  }>();
  const chFlag = `${chShip}/${chName}`;
  const nest = `heap/${chFlag}`;
  const { group, groupChannel: channel } = useFullChannel({
    groupFlag,
    nest,
  });
  const isMobile = useIsMobile();
  const { note, isLoading } = useNote(nest, idCurio || '');
  const { title: curioTitle } = getHanDataFromEssay(note.essay);
  const { hasNext, hasPrev, nextNote, prevNote } = useOrderedNotes(
    nest,
    idCurio || ''
  );
  const initialNote = location.state?.initialCurio as Note | undefined;
  const essay = note?.essay || initialNote?.essay;

  const curioHref = (id?: bigInt.BigInteger) => {
    if (!id) {
      return '/';
    }

    return `/groups/${groupFlag}/channels/heap/${chFlag}/curio/${id}`;
  };

  useGroupsAnalyticsEvent({
    name: 'view_item',
    groupFlag,
    chFlag,
    channelType: 'heap',
  });

  // we have no data at all just show spinner
  if (!essay && isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // with at least an essay we can show content and wait for everything else
  return (
    <Layout
      className="flex-1 bg-white"
      header={
        <HeapDetailHeader
          nest={nest}
          idCurio={idCurio || ''}
          essay={essay}
          groupFlag={groupFlag}
        />
      }
    >
      <Helmet>
        <title>
          {note && channel && group
            ? `${curioTitle || 'Gallery Item'} in ${channel.meta.title} • ${
                group.meta.title || ''
              } ${title}`
            : title}
        </title>
      </Helmet>
      <div className="flex h-full flex-col overflow-y-auto lg:flex-row">
        <div className="group relative flex flex-1">
          {hasNext ? (
            <div className="absolute top-0 left-0 flex h-full w-16 flex-col justify-center">
              <Link
                to={curioHref(nextNote?.[0])}
                className={cn(
                  ' z-40 flex h-16 w-16 flex-col items-center justify-center bg-transparent',
                  !isMobile &&
                    'opacity-0 transition-opacity group-hover:opacity-100'
                )}
              >
                <div className="h-8 w-8 rounded border-gray-300 bg-white p-[3px]">
                  <CaretLeftIcon className="my-0 mx-auto block h-6 w-6 text-gray-300" />
                </div>
              </Link>
            </div>
          ) : null}
          <HeapDetailBody essay={essay} />
          {hasPrev ? (
            <div className="absolute top-0 right-0 flex h-full w-16 flex-col justify-center">
              <Link
                to={curioHref(prevNote?.[0])}
                className={cn(
                  ' z-40 flex h-16 w-16 flex-col items-center justify-center bg-transparent',
                  !isMobile &&
                    'opacity-0 transition-opacity group-hover:opacity-100'
                )}
              >
                <div className="h-8 w-8 rounded border-gray-300 bg-white p-[3px]">
                  <CaretRightIcon className="my-0 mx-auto block h-6 w-6 text-gray-300" />
                </div>
              </Link>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-col lg:h-full lg:w-72 lg:border-l-2 lg:border-gray-50 xl:w-96">
          <HeapDetailSidebarInfo essay={essay} />
          {idCurio && (
            <HeapDetailComments
              time={idCurio}
              comments={note.seal.quips ?? newQuipMap()}
              loading={isLoading}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}

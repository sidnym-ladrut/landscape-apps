import React, { useState, useCallback } from 'react';
import { useParams } from 'react-router';
import { Link } from 'react-router-dom';
import { useDismissNavigate } from '@/logic/routing';
import { pluralize } from '@/logic/utils';
import { useMultiDm } from '@/state/chat';
import Avatar from '@/components/Avatar';
import ShipName from '@/components/ShipName';
import BubbleIcon from '@/components/icons/BubbleIcon';
import ShipConnection from '@/components/ShipConnection';
import { useConnectivityCheck } from '@/state/vitals';
import Bullet16Icon from '@/components/icons/Bullet16Icon';
import Dialog from '../components/Dialog';
import MultiDMInfoForm from './MultiDMInfoForm';
import MultiDmAvatar from './MultiDmAvatar';

function ShipConnectionData(ship: string) {
  const { data, showConnection } = useConnectivityCheck(ship || '');
  return data;
}

export default function MultiDMEditModal() {
  const dismiss = useDismissNavigate();
  const clubId = useParams<{ id: string }>().id!;
  const club = useMultiDm(clubId);
  const count = club?.team.length;
  const pendingCount = club?.hive.length;
  const hasPending = pendingCount && pendingCount > 0;
  const [editing, setEditing] = useState(false);
  const setEditingCb = useCallback(
    (v) => {
      setEditing(v);
    },
    [setEditing]
  );

  return (
    <Dialog
      defaultOpen
      onOpenChange={(open) => !open && dismiss()}
      containerClass="w-max-lg"
    >
      {editing ? (
        <div className="w-80">
          <header className="flex items-center ">
            <h2 className="text-xl font-bold">Edit Chat Info</h2>
          </header>
          <MultiDMInfoForm
            setEditing={setEditingCb}
            setOpen={() => dismiss()}
          />
        </div>
      ) : (
        <>
          <div className="w-80">
            <header className="flex items-center ">
              <h2 className="text-xl font-bold">Chat Info</h2>
            </header>
          </div>
          {club && count && (
            <div className="flex flex-col items-center space-y-5">
              <MultiDmAvatar {...club.meta} size="huge" />
              <div className="text-center">
                <div className="text-gray-600">
                  <span>{`${count} ${pluralize('Member', count)}${
                    hasPending ? ', ' : ''
                  }`}</span>
                  {hasPending ? (
                    <span className="text-blue">{pendingCount} Pending</span>
                  ) : null}
                </div>
                <h2 className="text-lg font-semibold">{club.meta.title}</h2>
              </div>
              <button className="button" onClick={() => setEditing(true)}>
                Edit Chat Info
              </button>
              {hasPending ? (
                <>
                  <h3 className="-mb-2 w-full text-left text-lg font-semibold text-gray-400">
                    Pending
                  </h3>
                  <div className="flex w-full flex-col space-y-1">
                    {club.hive.map((ship) => (
                      <div
                        className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-50"
                        key={ship}
                      >
                        <Avatar size="small" ship={ship} />
                        <div className="flex grow flex-col">
                          <div className="flex items-center space-x-1">
                            <ShipName
                              name={ship}
                              showAlias={true}
                              className="font-semibold text-gray-800"
                            />
                            <ShipConnection
                              ship={ship}
                              showText={false}
                              status={ShipConnectionData(ship).status}
                            />
                          </div>
                          <ShipName
                            name={ship}
                            showAlias={false}
                            className="text-sm font-semibold text-gray-400"
                          />
                        </div>
                        <Link to={`/dm/${ship}`} aria-label={`Message ${ship}`}>
                          <BubbleIcon className="h-6 w-6 text-gray-400" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
              <h3 className="-mb-2 w-full text-left text-lg font-semibold text-gray-400">
                Members
              </h3>
              <div className="flex w-full flex-col space-y-1">
                {club.team.map((ship) => (
                  <div
                    className="flex items-center space-x-2 rounded-lg p-2 hover:bg-gray-50"
                    key={ship}
                  >
                    <Avatar size="small" ship={ship} />
                    <div className="flex grow flex-col">
                      <div className="flex items-center space-x-1">
                        <ShipName
                          name={ship}
                          showAlias={true}
                          className="font-semibold text-gray-800"
                        />
                        {ship !== window.our ? (
                          <ShipConnection
                            ship={ship}
                            showText={false}
                            status={ShipConnectionData(ship).status}
                          />
                        ) : (
                          <span title="This is you">
                            <Bullet16Icon className="h-4 w-4 text-green-300" />
                          </span>
                        )}
                      </div>
                      <ShipName
                        name={ship}
                        showAlias={false}
                        className="text-sm font-semibold text-gray-400"
                      />
                    </div>
                    <Link to={`/dm/${ship}`} aria-label={`Message ${ship}`}>
                      <BubbleIcon className="h-6 w-6 text-gray-400" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </Dialog>
  );
}

import { cite } from '@urbit/aura';
import { useMemo } from 'react';
import { SizableText } from 'tamagui';

import { useCalm } from '../contexts/calm';
import { useContact } from '../contexts/contacts';

export default function ShipName({
  name,
  full = false,
  showAlias = false,
  ...props
}: {
  name: string;
  full?: boolean;
  showAlias?: boolean;
}) {
  const contact = useContact(name);
  const separator = /([_^-])/;
  const citedName = useMemo(() => (full ? name : cite(name)), [name, full]);
  const calm = useCalm();

  if (!citedName) {
    return null;
  }

  const parts = citedName.replace('~', '').split(separator);
  const first = parts.shift();

  return (
    <SizableText
      accessibilityHint={
        calm.disableNicknames && contact.nickname ? contact.nickname : undefined
      }
      {...props}
    >
      {contact.nickname && !calm.disableNicknames && showAlias ? (
        <SizableText accessibilityHint={citedName}>
          {contact.nickname}
        </SizableText>
      ) : (
        <>
          <SizableText aria-hidden>~</SizableText>
          <SizableText>{first}</SizableText>
          {parts.length > 1 && (
            <>
              {parts.map((piece, index) => (
                <SizableText
                  key={`${piece}-${index}`}
                  aria-hidden={separator.test(piece)}
                >
                  {piece}
                </SizableText>
              ))}
            </>
          )}
        </>
      )}
    </SizableText>
  );
}

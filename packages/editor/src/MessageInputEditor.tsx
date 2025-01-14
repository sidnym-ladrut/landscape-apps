import {
  BlockquoteBridge,
  BoldBridge,
  CodeBridge,
  CoreBridge,
  HistoryBridge,
  ItalicBridge,
  LinkBridge,
  PlaceholderBridge,
  StrikeBridge,
  UnderlineBridge,
  useTenTap,
} from '@10play/tentap-editor';
import CodeBlock from '@tiptap/extension-code-block';
import { Slice } from '@tiptap/pm/model';
import { EditorView } from '@tiptap/pm/view';
import { EditorContent } from '@tiptap/react';
import { useCallback } from 'react';

import { MentionsBridge, ShortcutsBridge } from './bridges';
import { useIsDark } from './useMedia';

export const MessageInputEditor = () => {
  const handlePaste = useCallback(
    (_view: EditorView, event: ClipboardEvent, _slice: Slice) => {
      const text = event.clipboardData?.getData('text/plain');

      window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'paste', payload: text })
      );
    },
    []
  );

  const editor = useTenTap({
    bridges: [
      CoreBridge,
      BoldBridge,
      ItalicBridge,
      StrikeBridge,
      ShortcutsBridge,
      BlockquoteBridge,
      HistoryBridge.configureExtension({
        newGroupDelay: 100,
      }),
      CodeBridge,
      UnderlineBridge,
      PlaceholderBridge,
      MentionsBridge,
      LinkBridge.configureExtension({
        openOnClick: false,
      }).extendExtension({
        exitable: true,
      }),
    ],
    tiptapOptions: {
      extensions: [CodeBlock],
      editorProps: {
        handlePaste,
      },
    },
  });

  return (
    <EditorContent
      style={{
        overflow: 'auto',
        height: 'auto',
        // making this explicit
        fontSize: 16,
        color: useIsDark() ? 'white' : 'black',
        fontFamily:
          "System, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Ubuntu, 'Helvetica Neue', sans-serif",
      }}
      // @ts-expect-error bad
      editor={editor}
    />
  );
};

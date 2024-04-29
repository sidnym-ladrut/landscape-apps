import {
  BridgeExtension,
  EditorMessage,
  PlaceholderBridge,
  RichText,
  TenTapStartKit,
  useBridgeState,
  useEditorBridge,
} from '@10play/tentap-editor';
//ts-expect-error not typed
import { editorHtml } from '@tloncorp/editor/dist/editorHtml';
import { ShortcutsBridge } from '@tloncorp/editor/src/bridges';
import { tiptap } from '@tloncorp/shared/dist';
import type * as ub from '@tloncorp/shared/dist/urbit';
import { constructStory } from '@tloncorp/shared/dist/urbit';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Keyboard } from 'react-native';
import type { WebViewMessageEvent } from 'react-native-webview';

import { XStack } from '../../core';
import { MessageInputContainer, MessageInputProps } from './MessageInputBase';

type MessageEditorMessage = {
  type: 'contentHeight';
  payload: number;
} & EditorMessage;

// This function and the one below it are taken from RichText.tsx
// in the tentap-editor package.
// We need this because we're overriding the injectedJavaScript prop
// in the RichText component, and we need to make sure that the
// bridge extension CSS is injected into the WebView.
export const getStyleSheetCSS = (css: string, styleSheetTag: string) => {
  return `
    cssContent = \`${css}\`;
    head = document.head || document.getElementsByTagName('head')[0],
    styleElement = head.querySelector('style[data-tag="${styleSheetTag}"]');

    if (!styleElement) {
      // If no such element exists, create a new <style> element.
      styleElement = document.createElement('style');
      styleElement.setAttribute('data-tag', '${styleSheetTag}'); // Assign the unique 'data-tag' attribute.
      styleElement.type = 'text/css'; // Specify the type attribute for clarity.
      head.appendChild(styleElement); // Append the newly created <style> element to the <head>.
    }

    styleElement.innerHTML = cssContent;
    `;
};

const getInjectedJS = (bridgeExtensions: BridgeExtension[]) => {
  let injectJS = '';
  // For each bridge extension, we create a stylesheet with it's name as the tag
  const styleSheets = bridgeExtensions.map(({ extendCSS, name }) =>
    getStyleSheetCSS(extendCSS || '', name)
  );
  injectJS += styleSheets.join(' ');
  return injectJS;
};

// 52 accounts for the 16px padding around the text within the input
// and the 20px line height of the text. 16 + 20 + 16 = 52
const DEFAULT_CONTAINER_HEIGHT = 52;

export function MessageInput({
  shouldBlur,
  setShouldBlur,
  send,
  channelId,
  setImageAttachment,
  uploadedImage,
  canUpload,
}: MessageInputProps) {
  const [containerHeight, setContainerHeight] = useState(
    DEFAULT_CONTAINER_HEIGHT
  );
  const editor = useEditorBridge({
    customSource: editorHtml,
    autofocus: false,
    bridgeExtensions: [
      ...TenTapStartKit,
      PlaceholderBridge.configureExtension({
        placeholder: 'Message',
      }),
      ShortcutsBridge,
    ],
  });
  const editorState = useBridgeState(editor);
  const webviewRef = editor.webviewRef;

  useEffect(() => {
    if (editor && shouldBlur && editorState.isFocused) {
      editor.blur();
      setShouldBlur(false);
    }
  }, [shouldBlur, editor, editorState, setShouldBlur]);

  // We'll need this when we need to read the editor content.
  // editor._onContentUpdate = () => {
  // editor.getJSON().then((json: JSONContent) => {
  // });
  // };

  const sendMessage = useCallback(() => {
    editor.getJSON().then(async (json) => {
      const blocks: ub.Block[] = [];
      const inlines = tiptap.JSONToInlines(json);
      const story = constructStory(inlines);

      if (uploadedImage) {
        blocks.push({
          image: {
            src: uploadedImage.url,
            height: uploadedImage.size ? uploadedImage.size[0] : 200,
            width: uploadedImage.size ? uploadedImage.size[1] : 200,
            alt: 'image',
          },
        });
      }

      if (blocks && blocks.length > 0) {
        story.push(...blocks.map((block) => ({ block })));
      }

      await send(story, channelId);

      editor.setContent('');
    });
  }, [editor, send, channelId, uploadedImage]);

  const handleSend = useCallback(() => {
    Keyboard.dismiss();
    sendMessage();
  }, [sendMessage]);

  const handleAddNewLine = useCallback(() => {
    editor.splitBlock();
  }, [editor]);

  const handleMessage = useCallback(
    async (event: WebViewMessageEvent) => {
      const { data } = event.nativeEvent;
      if (data === 'enter') {
        handleAddNewLine();
        return;
      }

      if (data === 'shift-enter') {
        handleAddNewLine();
        return;
      }

      const { type, payload } = JSON.parse(data) as MessageEditorMessage;

      if (type === 'editor-ready') {
        webviewRef.current?.injectJavaScript(
          `
              function updateContentHeight() {
                const editorElement = document.querySelector('#root div .ProseMirror');
                editorElement.style.height = 'auto';
                editorElement.style.overflow = 'auto';
                const newHeight = editorElement.scrollHeight;
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'contentHeight', payload: newHeight }));
              }

              function setupMutationObserver() {
                // watch for changes in the content

                const observer = new MutationObserver(updateContentHeight);
                observer.observe(document.querySelector('#root'), { childList: true, subtree: true, attributes: true});

                updateContentHeight(); // this sets initial height
              }

              setupMutationObserver();
          `
        );
      }

      if (type === 'contentHeight') {
        setContainerHeight(payload);
        return;
      }

      editor.bridgeExtensions?.forEach((e) => {
        e.onEditorMessage && e.onEditorMessage({ type, payload }, editor);
      });
    },
    [editor, handleAddNewLine, webviewRef]
  );

  const tentapInjectedJs = useMemo(
    () => getInjectedJS(editor.bridgeExtensions || []),
    [editor.bridgeExtensions]
  );

  return (
    <MessageInputContainer
      setImageAttachment={setImageAttachment}
      onPressSend={handleSend}
      uploadedImage={uploadedImage}
      canUpload={canUpload}
    >
      <XStack
        borderRadius="$xl"
        height={containerHeight}
        backgroundColor="$secondaryBackground"
        paddingHorizontal="$l"
        flex={1}
      >
        <RichText
          style={{
            padding: 8,
            backgroundColor: '$secondaryBackground',
          }}
          editor={editor}
          onMessage={handleMessage}
          injectedJavaScript={`
              ${tentapInjectedJs}

              window.addEventListener('keydown', (e) => {

                if (e.key === 'Enter' && !e.shiftKey) {
                  window.ReactNativeWebView.postMessage('enter');
                  return;
                }

                if (e.key === 'Enter' && e.shiftKey) {
                  window.ReactNativeWebView.postMessage('shift-enter');
                  return;
                }

              });

              window.addEventListener('message', (event) => {
                const message = event.data;
                if (message === 'ready') {
                  setupMutationObserver();
                }
              });
            `}
        />
      </XStack>
    </MessageInputContainer>
  );
}

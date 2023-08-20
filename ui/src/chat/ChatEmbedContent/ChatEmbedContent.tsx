import React, { useEffect } from 'react';
import { Player } from 'video-react';
import { AUDIO_REGEX, validOembedCheck, VIDEO_REGEX } from '@/logic/utils';
import { useCalm } from '@/state/settings';
import { useEmbed } from '@/state/embed';
import YouTubeEmbed from './YouTubeEmbed';
import TwitterEmbed from './TwitterEmbed';
import SpotifyEmbed from './SpotifyEmbed';
import AudioPlayer from './AudioPlayer';

const trustedProviders = [
  {
    name: 'YouTube',
    regex: /youtube\.com\/watch\?v=|youtu\.be\//,
  },
  {
    name: 'Twitter',
    regex: /(?:twitter\.com|x\.com)\/\w+\/status\//,
  },
  {
    name: 'Spotify',
    regex: /open\.spotify\.com\//,
  },
];

function ChatEmbedContent({
  url,
  content,
  writId,
}: {
  url: string;
  content: string;
  writId: string;
}) {
  const { embed, isError, error } = useEmbed(url);
  const calm = useCalm();
  const isAudio = AUDIO_REGEX.test(url);
  const isVideo = VIDEO_REGEX.test(url);
  const isTrusted = trustedProviders.some((provider) =>
    provider.regex.test(url)
  );

  useEffect(() => {
    if (isError) {
      console.log(`chat embed failed to load:`, error);
    }
  }, [isError, error]);

  if (url !== content) {
    return (
      <a target="_blank" rel="noreferrer" href={url}>
        {content}
      </a>
    );
  }

  if (isVideo) {
    return (
      <div className="flex flex-col">
        <Player playsInline src={url} />
      </div>
    );
  }

  if (isAudio) {
    return <AudioPlayer url={url} embed writId={writId} />;
  }

  const isOembed = isTrusted && validOembedCheck(embed, url);

  if (isOembed && !calm?.disableRemoteContent) {
    const {
      title,
      thumbnail_url: thumbnail,
      provider_name: provider,
      url: embedUrl,
      author_name: author,
      author_url: authorUrl,
      html: embedHtml,
    } = embed;

    if (provider === 'YouTube') {
      return (
        <div className="flex flex-col">
          <YouTubeEmbed
            url={embedUrl}
            title={title}
            thumbnail={thumbnail}
            author={author}
            authorUrl={authorUrl}
            writId={writId}
          />
        </div>
      );
    }

    if (provider === 'Twitter') {
      return (
        <div className="flex w-[300px] flex-col sm:w-full">
          <TwitterEmbed embedHtml={embedHtml} />
        </div>
      );
    }

    if (provider === 'Spotify') {
      return (
        <div className="flex flex-col">
          <SpotifyEmbed
            url={url}
            title={title}
            thumbnailUrl={thumbnail}
            writId={writId}
          />
        </div>
      );
    }

    return (
      <a target="_blank" rel="noreferrer" href={url}>
        {content}
      </a>
    );
  }

  return (
    <a target="_blank" rel="noreferrer" href={url}>
      {content}
    </a>
  );
}

export default React.memo(ChatEmbedContent);

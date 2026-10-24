export type YTPlayer = {
  destroy(): void;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  pauseVideo(): void;
  playVideo(): void;
  cueVideoById(input: { videoId: string; startSeconds: number }): void;
  loadVideoById(input: { videoId: string; startSeconds: number }): void;
};
type YTApi = { Player: new (element: HTMLElement, options: Record<string, unknown>) => YTPlayer };
declare global {
  interface Window {
    YT?: YTApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let pending: Promise<YTApi> | null = null;
export function loadYouTube(): Promise<YTApi> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (pending) return pending;
  pending = new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      pending = null;
      reject(new Error('YouTube could not load. Check your connection or open the source video.'));
    }, 15000);
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timer);
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    script.onerror = () => {
      clearTimeout(timer);
      pending = null;
      reject(new Error('YouTube could not load. Check your connection.'));
    };
    document.head.appendChild(script);
  });
  return pending;
}

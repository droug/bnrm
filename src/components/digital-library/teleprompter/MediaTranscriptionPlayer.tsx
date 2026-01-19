import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX,
  Maximize2,
  SkipBack,
  SkipForward
} from "lucide-react";
import { cn } from "@/lib/utils";
import Teleprompter from "./Teleprompter";

interface TranscriptSegment {
  id: string;
  text: string;
  startTime: number;
  endTime: number;
}

interface MediaTranscriptionPlayerProps {
  mediaUrl: string;
  mediaType: 'audio' | 'video';
  transcript: string;
  segments: TranscriptSegment[];
  title?: string;
  className?: string;
}

export default function MediaTranscriptionPlayer({
  mediaUrl,
  mediaType,
  transcript,
  segments,
  title,
  className
}: MediaTranscriptionPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);

  // Update time display
  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
    };
  }, []);

  // Play/Pause
  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
  };

  // Seek
  const handleSeek = (time: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.currentTime = time;
    setCurrentTime(time);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    const media = mediaRef.current;
    if (!media) return;
    const newTime = Math.max(0, Math.min(duration, media.currentTime + seconds));
    media.currentTime = newTime;
  };

  // Volume control
  const handleVolumeChange = (value: number) => {
    const media = mediaRef.current;
    if (!media) return;
    setVolume(value);
    media.volume = value;
    setIsMuted(value === 0);
  };

  // Toggle mute
  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    
    if (isMuted) {
      media.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      media.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Media Player */}
      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Title */}
          {title && (
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{title}</h3>
              <Badge variant="outline">{mediaType === 'audio' ? 'Audio' : 'Vidéo'}</Badge>
            </div>
          )}

          {/* Video Player */}
          {mediaType === 'video' && (
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video
                ref={mediaRef as React.RefObject<HTMLVideoElement>}
                src={mediaUrl}
                className="w-full h-full object-contain"
                preload="metadata"
              />
            </div>
          )}

          {/* Audio Player (hidden element) */}
          {mediaType === 'audio' && (
            <audio
              ref={mediaRef as React.RefObject<HTMLAudioElement>}
              src={mediaUrl}
              preload="metadata"
              className="hidden"
            />
          )}

          {/* Controls */}
          <div className="space-y-3">
            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-12">
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                onValueChange={([v]) => handleSeek(v)}
                max={duration || 100}
                step={0.1}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-12 text-right">
                {formatTime(duration)}
              </span>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={() => skip(-10)}>
                  <SkipBack className="h-4 w-4" />
                </Button>
                
                <Button 
                  variant="default" 
                  size="icon" 
                  onClick={togglePlay}
                  className="h-10 w-10"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button variant="outline" size="icon" onClick={() => skip(10)}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-4 w-4" />
                  ) : (
                    <Volume2 className="h-4 w-4" />
                  )}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume]}
                  onValueChange={([v]) => handleVolumeChange(v)}
                  max={1}
                  step={0.1}
                  className="w-24"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teleprompter */}
      <Teleprompter
        transcript={transcript}
        segments={segments}
        currentTime={currentTime}
        isPlaying={isPlaying}
        onSeek={handleSeek}
      />
    </div>
  );
}

import { Mic, Square } from 'lucide-react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface RecordingInterfaceProps {
  onTranscriptComplete: (transcript: string) => void;
  isProcessing: boolean;
}

export const RecordingInterface = ({ onTranscriptComplete, isProcessing }: RecordingInterfaceProps) => {
  const { isRecording, transcript, interimTranscript, isSupported, error, startRecording, stopRecording } =
    useSpeechRecognition();

  const handleButtonClick = () => {
    if (isRecording) {
      stopRecording();
      if (transcript.trim()) {
        onTranscriptComplete(transcript.trim());
      }
    } else {
      startRecording();
    }
  };

  const displayTranscript = transcript + (interimTranscript ? ' ' + interimTranscript : '');

  if (!isSupported) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white border-4 border-black p-8 text-center">
          <p className="text-xl font-bold text-black">
            Speech recognition is not supported in this browser.
          </p>
          <p className="text-lg text-black mt-4">Please use Chrome, Edge, or Safari.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <button
        onClick={handleButtonClick}
        disabled={isProcessing}
        className={`w-full h-32 text-2xl font-bold border-4 border-black transition-colors ${
          isRecording
            ? 'bg-black text-white'
            : isProcessing
            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
            : 'bg-white text-black hover:bg-gray-100'
        }`}
      >
        <div className="flex items-center justify-center gap-4">
          {isRecording ? (
            <>
              <Square className="w-12 h-12" fill="currentColor" />
              <span>Stop Recording</span>
            </>
          ) : isProcessing ? (
            <span>Processing...</span>
          ) : (
            <>
              <Mic className="w-12 h-12" />
              <span>Record Patient Check-in</span>
            </>
          )}
        </div>
      </button>

      {isRecording && (
        <div className="mt-6 p-4 bg-black text-white border-4 border-black">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-4 h-4 bg-white rounded-full animate-pulse"></div>
            <span className="text-lg font-bold">RECORDING...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-6 bg-white border-4 border-black">
          <p className="text-lg font-bold text-black">{error}</p>
        </div>
      )}

      {displayTranscript && (
        <div className="mt-6 p-6 bg-white border-4 border-black">
          <h3 className="text-xl font-bold text-black mb-4">Transcript:</h3>
          <p className="text-lg text-black whitespace-pre-wrap leading-relaxed">{displayTranscript}</p>
        </div>
      )}
    </div>
  );
};

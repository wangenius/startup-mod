import { useState } from 'react';

function RoomManager({ playerName, onRoomAction }) {
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    try {
      await onRoomAction('create', roomId.trim());
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) return;
    setLoading(true);
    try {
      await onRoomAction('join', roomId.trim());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎮 游戏大厅</h1>
          <p className="text-gray-600">欢迎，{playerName}！</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              房间ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="输入房间ID"
              disabled={loading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={handleCreateRoom}
              disabled={!roomId.trim() || loading}
              className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '创建中...' : '🏗️ 创建房间'}
            </button>
            
            <button
              onClick={handleJoinRoom}
              disabled={!roomId.trim() || loading}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? '加入中...' : '🚪 加入房间'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RoomManager;
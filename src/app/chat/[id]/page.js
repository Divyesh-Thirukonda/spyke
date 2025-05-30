// File: src/app/chat/[id]/page.js
"use client";
import { useRouter, useParams } from 'next/navigation';
import ChatRoom from '../../../components/ChatRoom';
import { useCallback } from 'react';
import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';

export default function ChatRoomPage() {
    const { id: roomId } = useParams();
    const router = useRouter();
    const [chatName, setChatName] = useState('');
    const [isGroup, setIsGroup] = useState(false);

    // Get current chat name from roomId
    useEffect(() => {
        // if user is not a member of the room, redirect to home
        const checkMembership = async () => {
            // Get current user
            const {
                data: { user },
                error: userError,
            } = await supabase.auth.getUser();
            if (userError || !user) {
                router.replace('/login');
                return;
            }

            // Verify membership
            const { data, error } = await supabase
                .from('chat_members')
                .select('room_id')
                .eq('member_id', user.id)
                .eq('room_id', roomId)
                .single();
            if (error || !data) {
                router.replace('/');
            }
        };
        checkMembership();
        const fetchChatName = async () => {
            const { data: { title, is_group } } = await supabase
                .from('chat_rooms')
                .select('title, is_group')
                .eq('id', roomId)
                .single();
            setChatName(title);
            setIsGroup(is_group);

            if (!title) {
                if (is_group) setChatName('Group Chat');
                setChatName('Chat');
            }
        };
        fetchChatName();
    }, [roomId]);

    if (!roomId) {
        router.push('/');
        return null;
    }

    useEffect(() => {
        // simple mobile check
        const isMobile = /Mobi|Android|iPhone|iPad|iPod/.test(navigator.userAgent);
        if (isMobile && document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(console.error);
        }
      }, []);

    const toggleFullScreen = useCallback(() => {
        if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
        } else {
        document.exitFullscreen();
        }
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
        <header className="flex items-center flex-none p-4 bg-gray-100 border-b">
            {/* p-4 bg-gray-100 border-b  */}
            <button onClick={() => router.push('/')} className="text-blue-500 mr-4">
            ←
            </button>
            <h2 className="text-xl">{chatName}</h2>

            <div className="align-items-center ml-auto">
                <button
                    onClick={toggleFullScreen}
                    className="px-2 py-1 text-sm rounded hover:bg-gray-200"
                    aria-label="Toggle Full Screen"
                >
                    ⛶
                </button>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto">
            <ChatRoom roomId={roomId} />
        </div>
        </div>
    );
}

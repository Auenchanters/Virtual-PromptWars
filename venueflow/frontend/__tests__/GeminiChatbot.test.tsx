import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GeminiChatbot from '../src/components/GeminiChatbot';
import * as hooks from '../src/hooks/useGemini';

jest.mock('../src/hooks/useGemini');

describe('GeminiChatbot Component', () => {
    it('GeminiChatbot renders input field and send button', () => {
        (hooks.useGemini as jest.Mock).mockReturnValue({
            sendMessage: jest.fn(),
            loading: false
        });
        render(<GeminiChatbot />);
        
        // Open the dialog first
        const openBtn = screen.getByLabelText('Open Venue Assistant Chat');
        fireEvent.click(openBtn);
        
        expect(screen.getByPlaceholderText(/Where is Gate 4/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Send message' })).toBeInTheDocument();
    });

    it('GeminiChatbot displays loading state while waiting for Gemini response', async () => {
        (hooks.useGemini as jest.Mock).mockReturnValue({
            sendMessage: jest.fn().mockReturnValue(new Promise(() => {})), // never resolves
            loading: true
        });
        render(<GeminiChatbot />);
        
        const openBtn = screen.getByLabelText('Open Venue Assistant Chat');
        fireEvent.click(openBtn);

        expect(screen.getByLabelText('Loading...')).toBeInTheDocument();
    });

    it('GeminiChatbot handles empty/null Gemini response without crashing', async () => {
        const mockSendMessage = jest.fn().mockResolvedValue(null);
        (hooks.useGemini as jest.Mock).mockReturnValue({
            sendMessage: mockSendMessage,
            loading: false
        });
        
        render(<GeminiChatbot />);
        
        const openBtn = screen.getByLabelText('Open Venue Assistant Chat');
        fireEvent.click(openBtn);
        
        const input = screen.getByPlaceholderText(/Where is Gate 4/i);
        const sendBtn = screen.getByRole('button', { name: 'Send message' });
        
        fireEvent.change(input, { target: { value: 'Hello' } });
        fireEvent.click(sendBtn);
        
        await waitFor(() => {
            expect(screen.getByText('Error: Could not get a response.')).toBeInTheDocument();
        });
    });
});

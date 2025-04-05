'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Member } from '@/app/types/member';

interface MemberModalContextType {
  selectedMember: Member | null;
  setSelectedMember: (member: Member | null) => void;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
}

const MemberModalContext = createContext<MemberModalContextType | undefined>(undefined);

export function MemberModalProvider({ children }: { children: ReactNode }) {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <MemberModalContext.Provider value={{
      selectedMember,
      setSelectedMember,
      isModalOpen,
      setIsModalOpen
    }}>
      {children}
    </MemberModalContext.Provider>
  );
}

export function useMemberModal() {
  const context = useContext(MemberModalContext);
  if (context === undefined) {
    throw new Error('useMemberModal must be used within a MemberModalProvider');
  }
  return context;
}

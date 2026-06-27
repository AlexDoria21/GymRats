import { ConfirmDialog } from './components/ConfirmDialog';
import { FinishSessionDialog } from './components/FinishSessionDialog';
import { Fab } from './components/Fab';
import { Header } from './components/Header';
import { HelpSheet } from './components/HelpSheet';
import { Modal } from './components/Modal';
import { ProgressSheet } from './components/ProgressSheet';
import { RestTimer } from './components/RestTimer';
import { SettingsSheet } from './components/SettingsSheet';
import { DayScreen } from './components/screens/DayScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { RoutineScreen } from './components/screens/RoutineScreen';
import { GymProvider, useGym } from './state/GymContext';

function Shell() {
  const { state } = useGym();
  return (
    <div className="relative mx-auto flex h-full max-w-[480px] flex-col overflow-hidden bg-bg font-sans text-ink">
      <Header />
      <div className="flex-1 overflow-y-auto overscroll-contain">
        {state.screen === 'home' && <HomeScreen />}
        {state.screen === 'routine' && <RoutineScreen />}
        {state.screen === 'day' && <DayScreen />}
      </div>
      <Fab />
      <Modal />
      <ProgressSheet />
      <SettingsSheet />
      <ConfirmDialog />
      <FinishSessionDialog />
      <HelpSheet />
      <RestTimer />
    </div>
  );
}

export default function App() {
  return (
    <GymProvider>
      <Shell />
    </GymProvider>
  );
}

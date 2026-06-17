import { ConfirmDialog } from './components/ConfirmDialog';
import { Fab } from './components/Fab';
import { Header } from './components/Header';
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
    <div className="relative mx-auto flex h-full max-w-[480px] flex-col overflow-hidden bg-[#0d0d0f] font-[Helvetica_Neue,Helvetica,system-ui,Arial,sans-serif] text-[#f3f3f4]">
      <Header />
      <div className="flex-1 overflow-y-auto">
        {state.screen === 'home' && <HomeScreen />}
        {state.screen === 'routine' && <RoutineScreen />}
        {state.screen === 'day' && <DayScreen />}
      </div>
      <Fab />
      <Modal />
      <ProgressSheet />
      <SettingsSheet />
      <ConfirmDialog />
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

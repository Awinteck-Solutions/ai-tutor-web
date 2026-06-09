import { Drawer } from '@mantine/core';
import ChatExperience from './ChatExperience';

const ChatPanel = ({ opened, onClose, context = {} }) => (
  <Drawer
    opened={opened}
    onClose={onClose}
    withCloseButton={false}
    padding={0}
    position="right"
    size="90%"
    overlayProps={{ backgroundOpacity: 0.55 }}
    classNames={{
      content: 'student-drawer-solid !bg-card !backdrop-blur-none p-0',
      header: 'hidden',
      body: 'student-drawer-solid !bg-card h-full p-0',
    }}
  >
    <ChatExperience context={context} onClose={onClose} />
  </Drawer>
);

export default ChatPanel;

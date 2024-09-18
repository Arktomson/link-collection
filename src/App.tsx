import LinkManagementSystem from './components/LinkManagementSystem';
import { Storage } from './utils';
function App() {
  const dataSource = Storage.get('dataSource');
  return <LinkManagementSystem dataSource={dataSource} />;
}

export default App;

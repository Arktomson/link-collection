import LinkManagementSystem from './components/Test';
import { Storage } from './utils';
function App() {
  const engine = Storage.get('engine') || [];
  const page = Storage.get('page') || [];
  const scene = Storage.get('scene') || [];
  const project = Storage.get('project') || [];
  return (
    <LinkManagementSystem
      engine={engine}
      page={page}
      scene={scene}
      project={project}
    />
  );
}

export default App;

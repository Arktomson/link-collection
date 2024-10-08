import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  Input,
  List,
  Typography,
  message,
  Modal,
  Form,
} from 'antd';
import {
  CopyOutlined,
  LinkOutlined,
  PlusOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { Storage } from '../utils';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface Engine {
  id: number;
  name: string;
}

interface Project {
  id: number;
  engineId: number;
  name: string;
}

interface Page {
  id: number;
  projectId: number;
  name: string;
}

interface Scene {
  id: number;
  pageId: number;
  name: string;
  link: string;
}
interface LinkManagementSystemProps {
  engine: Engine[];
  project: Project[];
  page: Page[];
  scene: Scene[];
}
const LinkManagementSystem: React.FC<LinkManagementSystemProps> = ({
  engine,
  project,
  page,
  scene,
}) => {
  const [selectedEngine, setSelectedEngine] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  // 从 localStorage 加载数据，如果没有则使用空数组
  const [engines, setEngines] = useState<Engine[]>(engine);
  const [projects, setProjects] = useState<Project[]>(project);
  const [pages, setPages] = useState<Page[]>(page);
  const [scenes, setScenes] = useState<Scene[]>(scene);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    // 在组件挂载时，如果有数据，选择第一个引擎、项目和页面
    if (engines.length > 0) {
      const firstEngine = engines[0];
      setSelectedEngine(firstEngine.id);

      // 查找该引擎下的第一个项目
      const firstProject = projects.find(
        (project) => project.engineId === firstEngine.id
      );
      if (firstProject) {
        setSelectedProject(firstProject.id);

        // 查找该项目下的第一个页面
        const firstPage = pages.find(
          (page) => page.projectId === firstProject.id
        );
        if (firstPage) {
          setSelectedPage(firstPage.id);
        }
      }
    }
  }, [engines, projects, pages]);

  const handleEngineSelect = (engineId: number) => {
    setSelectedEngine(engineId);
    setSelectedProject(null);
    setSelectedPage(null);
  };

  const handleProjectSelect = (projectId: number) => {
    setSelectedProject(projectId);
    setSelectedPage(null);
  };

  const handlePageSelect = (pageId: number) => {
    setSelectedPage(pageId);
  };

  const handleAddItem = (type: string, parentId: number | null = null) => {
    setModalType(type);
    setIsModalVisible(true);
    if (type === 'scene' && parentId !== null) {
      form.setFieldsValue({ pageId: parentId });
    } else if (type === 'page' && parentId !== null) {
      form.setFieldsValue({ projectId: parentId });
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      switch (modalType) {
        case 'engine':
          const newEngine = { id: Date.now(), name: values.name };
          const updatedEngines = [...engines, newEngine];
          setEngines(updatedEngines);
          Storage.set('engine', updatedEngines); // 更新 localStorage
          break;
        case 'project':
          if (selectedEngine !== null) {
            const newProject = {
              id: Date.now(),
              engineId: selectedEngine,
              name: values.name,
            };
            const updatedProjects = [...projects, newProject];
            setProjects(updatedProjects);
            Storage.set('project', updatedProjects); // 更新 localStorage
          }
          break;
        case 'page':
          if (selectedProject !== null) {
            const newPage = {
              id: Date.now(),
              projectId: selectedProject,
              name: values.name,
            };
            const updatedPages = [...pages, newPage];
            setPages(updatedPages);
            Storage.set('page', updatedPages); // 更新 localStorage
          }
          break;
        case 'scene':
          if (values.pageId !== null) {
            const newScene = {
              id: Date.now(),
              pageId: values.pageId,
              name: values.name,
              link: values.link,
            };
            const updatedScenes = [...scenes, newScene];
            setScenes(updatedScenes);
            Storage.set('scene', updatedScenes); // 更新 localStorage
          }
          break;
      }
      form.resetFields();
      setIsModalVisible(false);
      message.success(`${modalType}添加成功`);
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleDeleteScene = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该场景吗？',
      onOk: () => {
        const updatedScenes = scenes.filter((scene) => scene.id !== id);
        setScenes(updatedScenes);
        Storage.set('scene', updatedScenes); // 更新 localStorage
      },
    });
  };

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link).then(() => {
      message.success('链接已复制到剪贴板');
    });
  };

  const filteredProjects = projects?.filter(
    (project) => project.engineId === selectedEngine
  );
  const filteredPages = pages?.filter(
    (page) => page.projectId === selectedProject
  );
  const filteredScenes = scenes.filter(
    (scene) => scene.pageId === selectedPage
  );

  const renderModalContent = () => {
    switch (modalType) {
      case 'engine':
        return (
          <Form.Item
            name="name"
            label="仓库名称"
            rules={[{ required: true, message: '请输入仓库名称' }]}
          >
            <Input />
          </Form.Item>
        );
      case 'project':
        return (
          <Form.Item
            name="name"
            label="项目名称"
            rules={[{ required: true, message: '请输入项目名称' }]}
          >
            <Input />
          </Form.Item>
        );
      case 'page':
        return (
          <Form.Item
            name="name"
            label="页面名称"
            rules={[{ required: true, message: '请输入页面名称' }]}
          >
            <Input />
          </Form.Item>
        );
      case 'scene':
        return (
          <>
            <Form.Item
              name="name"
              label="场景名称"
              rules={[{ required: true, message: '请输入场景名称' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="link"
              label="场景链接"
              rules={[{ required: true, message: '请输入场景链接' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="pageId" hidden>
              <Input />
            </Form.Item>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'auto' }}>
      <Sider
        width={200}
        theme="light"
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflowY: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
          }}
        >
          <Title level={4}>仓库</Title>
          <Button
            icon={<PlusOutlined />}
            onClick={() => handleAddItem('engine')}
          >
            新增仓库
          </Button>
        </div>
        <Menu mode="inline" selectedKeys={[selectedEngine?.toString() || '']}>
          {engines.map((engine) => (
            <Menu.Item
              key={engine.id}
              onClick={() => handleEngineSelect(engine.id)}
            >
              {engine.name}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout style={{ marginLeft: 200 }}>
        <Header style={{ background: '#fff', padding: 0 }}>
          <Title level={3} style={{ margin: '16px 24px' }}>
            链接快速获取
          </Title>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            overflow: 'auto',
          }}
        >
          {selectedEngine !== null && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <Title level={3}>项目</Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddItem('project')}
                >
                  新增项目
                </Button>
              </div>
              <List
                dataSource={filteredProjects}
                renderItem={(project) => (
                  <List.Item
                    onClick={() => handleProjectSelect(project.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedProject === project.id ? '#f0f0f0' : '#fff',
                    }}
                  >
                    {project.name}
                  </List.Item>
                )}
              />
            </>
          )}

          {selectedProject !== null && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  marginBottom: '16px',
                }}
              >
                <Title level={3}>页面</Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddItem('page')}
                >
                  新增页面
                </Button>
              </div>
              <List
                dataSource={filteredPages}
                renderItem={(page) => (
                  <List.Item
                    onClick={() => handlePageSelect(page.id)}
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedPage === page.id ? '#f0f0f0' : '#fff',
                    }}
                  >
                    {page.name}
                  </List.Item>
                )}
              />
            </>
          )}

          {selectedPage !== null && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  marginBottom: '16px',
                }}
              >
                <Title level={3}>场景</Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddItem('scene', selectedPage)}
                >
                  新增场景
                </Button>
              </div>
              <List
                dataSource={filteredScenes}
                renderItem={(scene) => (
                  <List.Item
                    actions={[
                      <Button
                        icon={<CopyOutlined />}
                        onClick={() => handleCopyLink(scene.link)}
                      >
                        复制链接
                      </Button>,
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteScene(scene.id)}
                        danger
                      >
                        删除
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={scene.name}
                      description={scene.link}
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Content>
      </Layout>

      <Modal
        title="新增"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form}>{renderModalContent()}</Form>
      </Modal>
    </Layout>
  );
};

export default LinkManagementSystem;

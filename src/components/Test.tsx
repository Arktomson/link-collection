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
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
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

  const [engines, setEngines] = useState<Engine[]>(engine);
  const [projects, setProjects] = useState<Project[]>(project);
  const [pages, setPages] = useState<Page[]>(page);
  const [scenes, setScenes] = useState<Scene[]>(scene);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [editItem, setEditItem] = useState<any>(null);

  useEffect(() => {
    // 在组件挂载时，如果有数据，选择第一个引擎、项目和页面
    if (engines.length > 0) {
      const firstEngine = engines[0];
      setSelectedEngine(firstEngine.id);

      const firstProject = projects.find(
        (project) => project.engineId === firstEngine.id
      );
      if (firstProject) {
        setSelectedProject(firstProject.id);

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
    setEditItem(null);
    setIsModalVisible(true);
    if (type === 'scene' && parentId !== null) {
      form.setFieldsValue({ pageId: parentId });
    } else if (type === 'page' && parentId !== null) {
      form.setFieldsValue({ projectId: parentId });
    }
  };

  const handleEditItem = (type: string, item: any) => {
    setModalType(type);
    setEditItem(item);
    setIsModalVisible(true);
    form.setFieldsValue({ name: item.name, link: item.link || '' });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editItem) {
        // 修改逻辑
        if (modalType === 'engine') {
          const updatedEngines = engines.map((engine) =>
            engine.id === editItem.id
              ? { ...engine, name: values.name }
              : engine
          );
          setEngines(updatedEngines);
          Storage.set('engine', updatedEngines);
        } else if (modalType === 'project') {
          const updatedProjects = projects.map((project) =>
            project.id === editItem.id
              ? { ...project, name: values.name }
              : project
          );
          setProjects(updatedProjects);
          Storage.set('project', updatedProjects);
        } else if (modalType === 'page') {
          const updatedPages = pages.map((page) =>
            page.id === editItem.id ? { ...page, name: values.name } : page
          );
          setPages(updatedPages);
          Storage.set('page', updatedPages);
        } else if (modalType === 'scene') {
          const updatedScenes = scenes.map((scene) =>
            scene.id === editItem.id
              ? { ...scene, name: values.name, link: values.link }
              : scene
          );
          setScenes(updatedScenes);
          Storage.set('scene', updatedScenes);
        }
      } else {
        // 添加逻辑
        switch (modalType) {
          case 'engine':
            const newEngine = { id: Date.now(), name: values.name };
            const updatedEngines = [...engines, newEngine];
            setEngines(updatedEngines);
            Storage.set('engine', updatedEngines);
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
              Storage.set('project', updatedProjects);
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
              Storage.set('page', updatedPages);
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
              Storage.set('scene', updatedScenes);
            }
            break;
        }
      }
      form.resetFields();
      setIsModalVisible(false);
      message.success(`${modalType}操作成功`);
    });
  };

  const handleModalCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
  };

  const handleDeleteEngine = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该仓库吗？',
      onOk: () => {
        const updatedEngines = engines.filter((engine) => engine.id !== id);
        const updatedProjects = projects.filter(
          (project) => project.engineId !== id
        );
        const updatedPages = pages.filter(
          (page) =>
            !updatedProjects.some((project) => project.id === page.projectId)
        );
        const updatedScenes = scenes.filter(
          (scene) => !updatedPages.some((page) => page.id === scene.pageId)
        );

        setEngines(updatedEngines);
        setProjects(updatedProjects);
        setPages(updatedPages);
        setScenes(updatedScenes);

        Storage.set('engine', updatedEngines);
        Storage.set('project', updatedProjects);
        Storage.set('page', updatedPages);
        Storage.set('scene', updatedScenes);

        message.success('仓库及其子元素删除成功');
      },
    });
  };

  const handleDeleteProject = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该项目吗？',
      onOk: () => {
        const updatedProjects = projects.filter((project) => project.id !== id);
        const updatedPages = pages.filter((page) => page.projectId !== id);
        const updatedScenes = scenes.filter(
          (scene) => !updatedPages.some((page) => page.id === scene.pageId)
        );

        setProjects(updatedProjects);
        setPages(updatedPages);
        setScenes(updatedScenes);

        Storage.set('project', updatedProjects);
        Storage.set('page', updatedPages);
        Storage.set('scene', updatedScenes);

        message.success('项目及其子页面删除成功');
      },
    });
  };

  const handleDeletePage = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该页面吗？',
      onOk: () => {
        const updatedPages = pages.filter((page) => page.id !== id);
        const updatedScenes = scenes.filter((scene) => scene.pageId !== id);

        setPages(updatedPages);
        setScenes(updatedScenes);

        Storage.set('page', updatedPages);
        Storage.set('scene', updatedScenes);

        message.success('页面及其场景删除成功');
      },
    });
  };

  const filteredProjects = projects?.filter(
    (project) => project.engineId === selectedEngine
  );
  const filteredPages = pages?.filter(
    (page) => page.projectId === selectedProject
  );
  const filteredScenes = scenes?.filter(
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
  const handleCopyLink = (link: string) => {
    navigator.clipboard
      .writeText(link)
      .then(() => {
        message.success('链接已复制到剪贴板');
      })
      .catch(() => {
        message.error('复制失败');
      });
  };
  const handleDeleteScene = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除该场景吗？',
      onOk: () => {
        const updatedScenes = scenes.filter((scene) => scene.id !== id);
        setScenes(updatedScenes);
        Storage.set('scene', updatedScenes);
        message.success('场景删除成功');
      },
    });
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
        <Menu
          mode="inline"
          selectedKeys={[selectedEngine?.toString() || '']}
          onClick={(e) => handleEngineSelect(Number(e.key))}
        >
          {engines.map((engine) => (
            <Menu.Item
              key={engine.id}
              style={{
                backgroundColor: selectedEngine === engine.id ? '#e6f7ff' : '',
              }}
            >
              {engine.name}
              <Button
                icon={<DeleteOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteEngine(engine.id);
                }}
                danger
                style={{ marginLeft: '10px' }}
              />
              <Button
                icon={<EditOutlined />}
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditItem('engine', engine);
                }}
                style={{ marginLeft: '10px' }}
              />
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
                        selectedProject === project.id ? '#e6f7ff' : '',
                    }}
                  >
                    {project.name}
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(project.id);
                      }}
                      danger
                      style={{ marginLeft: '10px' }}
                    />
                    <Button
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem('project', project);
                      }}
                      style={{ marginLeft: '10px' }}
                    />
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
                        selectedPage === page.id ? '#e6f7ff' : '',
                    }}
                  >
                    {page.name}
                    <Button
                      icon={<DeleteOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePage(page.id);
                      }}
                      danger
                      style={{ marginLeft: '10px' }}
                    />
                    <Button
                      icon={<EditOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem('page', page);
                      }}
                      style={{ marginLeft: '10px' }}
                    />
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
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => handleEditItem('scene', scene)}
                      style={{ marginLeft: '10px' }}
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Content>
      </Layout>

      <Modal
        title={editItem ? `修改${modalType}` : `新增${modalType}`}
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

import { useState } from 'react';
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
  Space,
} from 'antd';
import { CopyOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

interface LinkManagementSystemProps {
  dataSource: unknown[];
}

const LinkManagementSystem = ({ dataSource }: LinkManagementSystemProps) => {
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [engines, setEngines] = useState([
    { id: 1, name: '工程 A' },
    { id: 2, name: '工程 B' },
    { id: 3, name: '工程 C' },
  ]);
  const [projects, setProjects] = useState([
    { id: 1, engineId: 1, name: '项目 1' },
    { id: 2, engineId: 1, name: '项目 2' },
    { id: 3, engineId: 2, name: '项目 3' },
  ]);
  const [pages, setPages] = useState([
    { id: 1, projectId: 1, name: '页面 1' },
    { id: 2, projectId: 1, name: '页面 2' },
    { id: 3, projectId: 2, name: '页面 3' },
  ]);
  const [scenes, setScenes] = useState([
    {
      id: 1,
      pageId: 1,
      name: '场景 1',
      link: 'https://example.com/page1/scene1',
    },
    {
      id: 2,
      pageId: 1,
      name: '场景 2',
      link: 'https://example.com/page1/scene2',
    },
    {
      id: 3,
      pageId: 2,
      name: '场景 3',
      link: 'https://example.com/page2/scene1',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [form] = Form.useForm();

  const handleEngineSelect = (engineId) => {
    setSelectedEngine(engineId);
    setSelectedProject(null);
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProject(projectId);
  };

  const handleAddItem = (type, parentId = null) => {
    setModalType(type);
    setIsModalVisible(true);
    if (type === 'scene') {
      form.setFieldsValue({ pageId: parentId });
    } else if (type === 'page') {
      form.setFieldsValue({ projectId: parentId });
    }
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      switch (modalType) {
        case 'engine':
          setEngines([
            ...engines,
            { id: engines.length + 1, name: values.name },
          ]);
          break;
        case 'project':
          setProjects([
            ...projects,
            {
              id: projects.length + 1,
              engineId: selectedEngine,
              name: values.name,
            },
          ]);
          break;
        case 'page':
          setPages([
            ...pages,
            {
              id: pages.length + 1,
              projectId: selectedProject,
              name: values.name,
            },
          ]);
          break;
        case 'scene':
          setScenes([
            ...scenes,
            {
              id: scenes.length + 1,
              pageId: values.pageId,
              name: values.name,
              link: values.link,
            },
          ]);
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

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      message.success('链接已复制到剪贴板');
    });
  };

  const filteredProjects = projects.filter(
    (project) => project.engineId === selectedEngine
  );
  const filteredPages = pages.filter(
    (page) => page.projectId === selectedProject
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} theme="light">
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
        <Menu mode="inline" selectedKeys={[selectedEngine?.toString()]}>
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
      <Layout>
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
            minHeight: 280,
          }}
        >
          {selectedEngine && (
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
                      background:
                        selectedProject === project.id ? '#f0f0f0' : 'inherit',
                    }}
                  >
                    {project.name}
                  </List.Item>
                )}
              />
            </>
          )}
          {selectedProject && (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <Title level={4}>页面列表</Title>
                <Button
                  icon={<PlusOutlined />}
                  onClick={() => handleAddItem('page', selectedProject)}
                >
                  新增页面
                </Button>
              </div>
              <List
                dataSource={filteredPages}
                renderItem={(page) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          {page.name}
                          <Button
                            icon={<PlusOutlined />}
                            size="small"
                            onClick={() => handleAddItem('scene', page.id)}
                          >
                            新增场景
                          </Button>
                        </Space>
                      }
                      description={
                        <List
                          dataSource={scenes.filter(
                            (scene) => scene.pageId === page.id
                          )}
                          renderItem={(scene) => (
                            <List.Item
                              actions={[
                                <Button
                                  icon={<CopyOutlined />}
                                  size="small"
                                  onClick={() => handleCopyLink(scene.link)}
                                >
                                  复制
                                </Button>,
                                <Button
                                  icon={<LinkOutlined />}
                                  size="small"
                                  href={scene.link}
                                  target="_blank"
                                >
                                  访问
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
                      }
                    />
                  </List.Item>
                )}
              />
            </>
          )}
        </Content>
      </Layout>
      <Modal
        title={`添加新${modalType}`}
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

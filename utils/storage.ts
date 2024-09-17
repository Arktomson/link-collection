export class Storage {
  // 设置数据，自动将对象转换为 JSON 字符串
  static set(key, value) {
    try {
      const data = JSON.stringify(value);
      localStorage.setItem(key, data);
    } catch (error) {
      console.error('Set Error: ', error);
    }
  }

  // 获取数据，自动将 JSON 字符串转换为对象
  static get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get Error: ', error);
      return null;
    }
  }

  // 删除某个 key 的数据
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Remove Error: ', error);
    }
  }

  // 清空所有数据
  static clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Clear Error: ', error);
    }
  }

  // 获取存储的所有键名
  static keys() {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('Keys Error: ', error);
      return [];
    }
  }
  static len() {
    return localStorage.length;
  }
}

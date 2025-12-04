import api from './apiClient';

export async function fetchCourses() {
  const res = await api.get('/courses');
  return res.data;
}

export async function createCourse(payload) {
  const res = await api.post('/courses', payload);
  return res.data;
}

export async function fetchCourse(id) {
  const res = await api.get(`/courses/${id}`);
  return res.data;
}

export async function deleteCourse(id) {
  await api.delete(`/courses/${id}`);
}

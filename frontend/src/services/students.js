import api from './apiClient';

export async function fetchStudents({ page = 1, pageSize = 10, search = '', sort = '' } = {}) {
  const res = await api.get('/students', { params: { page, pageSize, search, sort } });
  const data = res.data;
  // normalize student objects to include courseIds for the frontend
  const normalize = (s) => ({
    ...s,
    courseIds: Array.isArray(s.enrollments) ? s.enrollments.map(e => (e.course?.id ?? e.courseId)) : []
  })

  if (Array.isArray(data)) return data.map(normalize)
  if (data?.items && Array.isArray(data.items)) return { ...data, items: data.items.map(normalize) }
  return normalize(data)
}

export async function fetchStudent(id) {
  const res = await api.get(`/students/${id}`);
  const s = res.data;
  return { ...s, courseIds: Array.isArray(s.enrollments) ? s.enrollments.map(e => (e.course?.id ?? e.courseId)) : [] }
}

export async function createStudent(payload) {
  const res = await api.post('/students', payload);
  return res.data;
}

export async function updateStudent(id, payload) {
  const res = await api.put(`/students/${id}`, payload);
  return res.data;
}

export async function deleteStudent(id) {
  await api.delete(`/students/${id}`);
}

export async function enrollStudent(id, courseIds) {
  // backend expects an array of ints in the body for /students/{id}/enroll
  await api.post(`/students/${id}/enroll`, courseIds);
}

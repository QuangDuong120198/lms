const _ = require('lodash');

const { Lesson, elasticsearchClient } = require('../models');

/**
 *
 * @param {import('cassandra-driver').types.Uuid} teacherId
 * @param {import('cassandra-driver').types.Uuid} courseId
 * @param {number} [page=1]
 */
function getLessonsByTeacherAndCourse(teacherId, courseId, page = 1) {
  page = _.toInteger(page);
  page = page < 1 ? 1 : page;

  teacherId = String(teacherId);
  courseId = String(courseId);

  return elasticsearchClient.search({
    index: 'lms.lesson',
    type: 'lesson',
    from: 10 * (page - 1),
    size: 10,
    body: {
      query: {
        bool: {
          must: [
            {
              match: {
                teacher_id: teacherId
              }
            },
            {
              match: {
                course_id: courseId
              }
            }
          ]
        }
      }
    }
  });
}

/**
 *
 * @param {import('cassandra-driver').types.Uuid} teacherId
 * @param {import('cassandra-driver').types.Uuid} courseId
 * @param {import('cassandra-driver').types.TimeUuid} lessonId
 */
function getLessonById(teacherId, courseId, lessonId) {
  teacherId = String(teacherId);
  courseId = String(courseId);
  lessonId = String(lessonId);

  const _id = JSON.stringify([teacherId, courseId, lessonId]);

  return elasticsearchClient.get({
    index: 'lms.lesson',
    type: 'lesson',
    id: _id
  });
}

/**
 *
 * @param {object} lessonData
 * @param {import('cassandra-driver').types.Uuid} lessonData.teacherId
 * @param {import('cassandra-driver').types.Uuid} lessonData.courseId
 * @param {import('cassandra-driver').types.TimeUuid} lessonData.id
 * @param {string} lessonData.title
 * @param {string} lessonData.content
 * @param {boolean} [insert=true]
 * @param {number} [ttl]
 */
function upsertLesson(lessonData, insert = true, ttl) {
  return Lesson.insert(
    {
      teacher_id: lessonData.teacherId,
      course_id: lessonData.courseId,
      id: lessonData.id,
      title: lessonData.title,
      content: lessonData.content
    },
    {
      ifNotExists: insert,
      ttl: ttl
    }
  );
}

/**
 *
 * @param {import('cassandra-driver').types.Uuid} teacherId
 * @param {import('cassandra-driver').types.Uuid} courseId
 * @param {import('cassandra-driver').types.TimeUuid} id
 * @param {number} [ttl]
 */
function removeLesson(teacherId, courseId, id, ttl) {
  return Lesson.remove(
    {
      teacher_id: teacherId,
      course_id: courseId,
      id: id
    },
    {
      ifExists: true,
      ttl: ttl
    }
  );
}

module.exports = {
  getLessonsByTeacherAndCourse: getLessonsByTeacherAndCourse,
  getLessonById: getLessonById,
  upsertLesson: upsertLesson,
  removeLesson: removeLesson
};
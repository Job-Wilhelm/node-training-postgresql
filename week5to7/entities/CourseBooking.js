const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CourseBooking",
  tableName: "COURSE_BOOKING",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      generated: "uuid",
      nullable: false,
    },
    user_id: {
      type: "uuid",
      nullable: false,
    },
    course_id: {
      type: "uuid",
      nullable: false,
    },
    booking_at: {
      type: "timestamp",
      createDate: true,
      name: "booking_at",
      nullable: false,
    },
    status: {
      type: "varchar",
      length: 20,
      nullable: false,
    },
    join_at: {
      type: "timestamp",
      nullable: true,
    },
    leave_at: {
      type: "timestamp",
      nullable: true,
    },
    cancelled_at: {
      type: "timestamp",
      name: "cancelled_at",
      nullable: true,
    },
    cancellation_reason: {
      type: "varchar",
      lenngth: 255,
      nullable: true,
    },
    created_at: {
      type: "timestamp",
      createDate: true,
      nullable: false,
    },
  },
  relations: {
    User: {
      target: "User",
      type: "many-to-one",
      joinColumn: {
        name: "user_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "course_booking_user_id_fk",
      },
    },
    Course: {
      target: "Course",
      type: "many-to-one",
      joinColumn: {
        name: "course_id",
        referencedColumnName: "id",
        foreignKeyConstraintName: "course_booking_course_id_fk",
      },
    },
  },
});

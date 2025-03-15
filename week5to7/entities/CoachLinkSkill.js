const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "CoachLinkSkill",
  table: "COACH_LINK_SKILL",
  columns: {
    id: {
      primary: true,
      type: "uuid",
      nullable: false,
      generated: "uuid",
    },
    coach_id: {
      type: "uuid",
      nullable: false,
    },
    skill_id: {
      type: "uuid",
      nullable: false,
    },
    created_at: {
      type: "timestamp",
      createdDate: true,
      nullable: false,
    },
  },
  relations: {
    Coach: {
      target: "Coach",
      type: "many-to-one",
      inverseSide: "CoachLinkSkill",
      joinColumn: {
        name: "coach_id",
        referencedColumnNames: "id",
        foreignKeyConstraintName: "coach_link_skill_coach_id_fk",
      },
      cascade: false,
    },
    Skill: {
      target: "Skill",
      type: "many-to-one",
      inverseSide: "CoachLinkSkill",
      joinColumn: {
        name: "skill_id",
        referencedColumnNames: "id",
        foreignKeyConstraintName: "coach_link_skill_skill_id_fk",
      },
      cascade: false,
    },
  },
});

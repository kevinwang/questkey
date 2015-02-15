module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        level: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 1
        },
        experience: {
            type: DataTypes.BIGINT,
            allowNull: false,
            defaultValue: 0
        }
    }, {
        classMethods: {
            associate: function(models) {
                User.hasMany(models.Quest, {as: 'OwnedQuests', foreignKey: 'OwnerId'});
                User.belongsToMany(models.Quest, {through: 'UsersQuests'});
            }
        },
        instanceMethods: {
            /**
             * Experience formula taken from HabitRPG
             * http://habitrpg.wikia.com/wiki/Experience_Points
             */
            getExperienceForLevel: function() {
                return Math.round((0.25 * Math.pow(this.level, 2) + 10 * this.level + 139.75) / 10) * 10;
            },
            /**
             * Increase experience by `amount` XP.
             * Level up if necessary.
             */
            increaseExperience: function(amount) {
                this.experience += amount;
                while (this.experience >= this.getExperienceForLevel()) {
                    this.experience -= this.getExperienceForLevel();
                    this.level++;
                }
                this.save();
            }
        }
    });
    return User;
};

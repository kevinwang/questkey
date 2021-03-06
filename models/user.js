var crypto = require('crypto');

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {isAlphanumeric: true}
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {isEmail: true}
        },
        level: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        experience: {
            type: DataTypes.INTEGER,
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
        getterMethods: {
            path: function() {
                return '/u/' + this.getDataValue('username');
            },
            avatarUrl: function() {
                if (this.title === 'Bill Gates') {
                    return 'http://s3.timetoast.com/public/uploads/photos/2124010/bill-gates-ms_medium_square.jpg';
                }
                return 'http://www.gravatar.com/avatar/' + crypto.createHash('md5').update(this.getDataValue('email')).digest('hex');
            },
            /**
             * Experience formula taken from HabitRPG
             * http://habitrpg.wikia.com/wiki/Experience_Points
             */
            experienceForLevel: function() {
                var level = this.getDataValue('level');
                return Math.round((0.25 * Math.pow(level, 2) + 10 * level + 139.75) / 10) * 10;
            },
            experiencePercentage: function() {
                return 100.0 * this.getDataValue('experience') / this.experienceForLevel;
            },
            title: function() {
                var level = this.getDataValue('level');
                if (level === 1) return 'Beginner';
                else if (level < 5) return 'Slight Boon to Society';
                else if (level < 10) return 'I Would Trust This Guy with Something';
                else if (level < 15) return 'All Around Nice Guy';
                else if (level < 20) return 'Quest Bridge Over Troubled Waters';
                else if (level < 25) return 'Stand-Up Guy';
                else if (level < 30) return 'Bill Gates';
                else if (level < 35) return 'Melinda Gates';
                else return 'Gandhi';
            }
        },
        instanceMethods: {
            /**
             * Increase experience by `amount` XP.
             * Level up if necessary.
             */
            increaseExperience: function(amount) {
                this.experience += amount;
                while (this.experience >= this.experienceForLevel) {
                    this.experience -= this.experienceForLevel;
                    this.level++;
                }
                this.save();
            }
        }
    });
    return User;
};

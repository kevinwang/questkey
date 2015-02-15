module.exports = function(sequelize, DataTypes) {
    var Quest = sequelize.define('Quest', {
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        location: {
            type: DataTypes.STRING,
            allowNull: false
        },
        reward: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('in progress', 'done', 'canceled'),
            allowNull: false,
            defaultValue: 'in progress'
        }
    }, {
        classMethods: {
            associate: function(models) {
                Quest.belongsTo(models.User, {as: 'Owner', foreignKey: 'OwnerId'});
                Quest.belongsToMany(models.User, {through: 'UsersQuests'});
            }
        },
        getterMethods: {
            /**
             * Return path to quest page.
             */
            path: function() {
                return '/quests/' + this.getDataValue('id');
            },
            /**
             * Return path to mark quest as complete.
             */
            endPath: function() {
                return this.path + '/end';
            },
            /**
             * Return path to cancel quest.
             */
            cancelPath: function() {
                return this.path + '/cancel';
            }
        }
    });
    return Quest;
};

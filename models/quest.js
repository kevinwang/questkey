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
        }
    }, {
        classMethods: {
            associate: function(models) {
                Quest.belongsTo(models.User, {as: 'Owner', foreignKey: 'OwnerId'});
                Quest.belongsToMany(models.User, {through: 'UsersQuests'});
            }
        },
        instanceMethods: {
            /**
             * Returns path to quest page.
             */
            getPath: function() {
                return '/quests/' + this.id;
            }
        }
    });
    return Quest;
};

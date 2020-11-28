######################################################################
# GEOM90007 Information Visualisation Assignment 1                   #
# Author: Yichao Xu                                                  #
# ID: 1045184                                                        #
# Data From:                                                         #     
# (1) https://github.com/fivethirtyeight/data/tree/master/nba-raptor #
# (2) https://projects.fivethirtyeight.com/2020-nba-player-ratings/  #
######################################################################

# Reading data
data <- read.csv("latest_RAPTOR_by_player.csv", header=TRUE)
player <- read.csv("player_data.csv", header=TRUE)

# Merging two dataframe
data <- merge(x=data, y=player, by.x="player_name", by.y="PLAYER", all=TRUE)

# Filtering data by Minutes Played (must > 1000 mins)
data <- subset(data,mp >= 1000)

# Dropping unnecessary data
data <- data[,c('player_name', 'raptor_total', 'TEAM', 'POSITION.S.')]

# Filtering top 5 players by their positions
poscol <- data$POSITION.S.
posname <- c("PG","SG","SF","PF","C")
topnum <- 5
topplayer <- data[0,]
for(i in 1:5){
  rightpos <- poscol %in% grep(posname[i], poscol, value = TRUE)
  filterdata <- subset(data, rightpos)
  filterdata <- filterdata[order(-filterdata$raptor_total),]
  filterdata <- filterdata[1:topnum,]
  for(j in 1:topnum){
    filterdata[j,'POSITION.S.'] <- posname[i]
  }
  topplayer <- rbind(topplayer,filterdata)
}

# Adjusting data for drawing
rownames(topplayer) <- NULL
topplayer <- topplayer[nrow(topplayer):1,]

# Setting bar space and color
colorname <- c('#E23A04', '#FEE20D', '#58DA9F', '#1272F6', '#38BA5A')
currentcol <- 1
barspace <- c(0)
barcolor <- colorname[currentcol]
for(i in 2:nrow(topplayer)){
  if((i-1)%%topnum==0){
    barspace[i] <- 1
    currentcol <- currentcol + 1
    barcolor[i] <- colorname[currentcol]
  }else{
    barspace[i] <- 0
    barcolor[i] <- colorname[currentcol]
  }
}

# Plotting bar chart and save it locally
pdf(file="NBA_Players.pdf")
par(mar=c(7,12,4,3),cex.axis=0.9)
bp <- barplot(topplayer$raptor_total, 
        beside=TRUE, las=1, horiz=TRUE, names=topplayer$player_name,
        xlim=c(0,12),space=barspace, col=barcolor)

# Setting legend and titles
legend(9,8, legend = posname, fill = rev(colorname))
title("Top 5 NBA Players by Positions\n      in the Season 2019-20", adj=0)
title(xlab="Overall RAPTOR Total",mgp=c(2,1,0))
title(ylab="Players",mgp=c(10,1,0))
text(topplayer$raptor_total-1, bp, labels = round(topplayer$raptor_total,digits = 2))

# Adding notes 
mtext('RAPTOR: Robust Algorithm (using) Player Tracking (and) On/Off Ratings.', side=1, line=3.5, at=2, cex=0.7)
mtext('PG - Point Guard, SG - Shooting Guard, SF - Small Forward, PF - Power Forward, C - Center.', side=1, line=4.2, at=3.68, cex=0.7)
mtext('Note: some players may play at multiple positions.', side=1, line=4.9, at=0.25, cex=0.7)
mtext('Data coming from FiveThirtyEight.', side=1, line=5.6, at=-0.9, cex=0.7)
dev.off()



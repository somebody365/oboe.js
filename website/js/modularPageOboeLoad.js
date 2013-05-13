$(function(){

   var requestOboe = oboe.parser()
         .onError(function(e){ console.error( e ) });            
   
   function allDefined(/* arg1, arg2 ... */) {
      var argArray = Array.prototype.slice.apply(arguments);
      return argArray.every(function(a){ return a !== undefined });   
   }   
   
   /* A tiny layer of glue to fix together oboe's callback and a request for soma to render the data */
   function renderTemplateWithData( template, fieldName, data ) {
       
      template.scope[fieldName] = data;
      template.render();
   }
   
   /* a convenient way to get a partially completed version of renderTemplateWithData */
   function sendNewDataToTemplate( template, fieldName ) {
      return renderTemplateWithData.bind(null, template, fieldName); 
   }

   function ActivityView( template ) {
   
      requestOboe.onFind({         
         '!.activity.heading'   : sendNewDataToTemplate( template, 'heading' )                        
      ,  '!.activity.$data[*]'  :  sendNewDataToTemplate( template, 'data' )
      });         
   }
   
   function SocialStatsView( template ) {   
      requestOboe.onFind({         
         '!.$socialStats.*' : sendNewDataToTemplate( template, 'socialStats' )            
      });         
   }
   
   function RecentAchievementsView( template ) {
      
      requestOboe.onFind({         
         '!.recentAchievements.$awards[*].*' : sendNewDataToTemplate( template, 'awards' )
      });         
   }   
   
   function UserView( template ) {
      
      requestOboe.onFind({
         '!.user' : sendNewDataToTemplate( template, 'user' )
      });
   }
   
   function ActivitySummaryView(template) {
            
      template.scope.calendar = [[]];
      
      template.scope.barWidth = function(timeSpent) {
         // return zero if we don't have the answer (this allows a nice animated effect when we do get the answer) 
         if( timeSpent === undefined || timeSpent.hours === undefined || timeSpent.minutes === undefined ) {
            return 0;
         }
         
         return Math.round(0.15 * parseInt(timeSpent.hours) * 60 + parseInt(timeSpent.minutes));
      };
                        
      requestOboe.onFind({
         '!.activitySummary.totalNumber'                     : sendNewDataToTemplate( template, 'totalNumber' )
      ,  '!.activitySummary.$byType.*'                       : sendNewDataToTemplate( template, 'byType' )          
      ,  '!.activitySummary.$calendar.weeks[*].days.*'       : sendNewDataToTemplate( template, 'calendar' )
      ,  '!.activitySummary.$calendar.weeks[*].timeSpent.*'  : sendNewDataToTemplate( template, 'calendar' )
      });
   }
   
   soma.template.helpers({
      gotData: function(/* arg1, arg2 ... */) {
         return allDefined.apply(null, arguments) ? 'loaded' : 'notLoaded';   
      },
      known: function(value) {
         return value === undefined? 'unknown':value;
      }
   });   
                      
   /* For a named module, finds the element in the DOM for it and wraps it in a soma template                           
    */
   function templateForModule(moduleName) {   
      return soma.template.create($('[data-module=' + moduleName + ']')[0]);
   }                      
                 
   SocialStatsView(templateForModule('socialStats'));                    
   ActivityView(templateForModule('tables'));
   RecentAchievementsView(templateForModule('recentAchievements'));
   UserView(templateForModule('accountBar'));
   UserView(templateForModule('user')); 
   ActivitySummaryView(templateForModule('activitySummary'));
          
   // ok, let's simulate a slow connection and feed the response into our oboe:
   FakeAjax.fetch(5, 5, requestOboe.read.bind(requestOboe));      
});